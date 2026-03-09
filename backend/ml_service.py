import os
import joblib
import pandas as pd
import numpy as np
import shap
import lime
import lime.lime_tabular
import dice_ml
import concurrent.futures

class DiCEWrapper:
    """
    Wraps the sklearn pipeline to recalculate derived features 
    on the fly during DiCE counterfactual generation.
    """
    def __init__(self, pipeline):
        self.pipeline = pipeline

    def predict(self, df):
        df_copy = df.copy()
        # Ensure we don't divide by zero during DiCE's random generation
        df_copy['loan_percent_income'] = df_copy['loan_amnt'] / df_copy['person_income'].clip(lower=1)
        return self.pipeline.predict(df_copy)

    def predict_proba(self, df):
        df_copy = df.copy()
        df_copy['loan_percent_income'] = df_copy['loan_amnt'] / df_copy['person_income'].clip(lower=1)
        return self.pipeline.predict_proba(df_copy)

class MLExplainabilityService:
    def __init__(self):
        self.pipeline = None
        self.model = None
        self.shap_explainer = None
        self.lime_explainer = None
        self.dice_explainer = None
        self.feature_names = []
        
        # File paths
        self.model_path = "loan_pipeline.pkl"
        self.background_data_path = "X_train_transformed.pkl"
        self.train_data_path = "loan_data.csv"

    def load_resources(self):
        print(f"Loading model from: {os.path.abspath(self.model_path)}")
        if not os.path.exists(self.model_path):
            print(f"⚠️ Critical: Model file '{self.model_path}' not found.")
            return

        try:
            self.pipeline = joblib.load(self.model_path)
            
            # 1. Initialize DiCE
            train_df = pd.read_csv(self.train_data_path)
            d = dice_ml.Data(
                dataframe=train_df,
                continuous_features=[
                    'person_age', 'person_income', 'person_emp_exp', 
                    'loan_amnt', 'loan_int_rate', 'loan_percent_income', 
                    'cb_person_cred_hist_length', 'credit_score'
                ],
                outcome_name='loan_status'
            )
            wrapped_model = DiCEWrapper(self.pipeline)
            m = dice_ml.Model(model=wrapped_model, backend="sklearn")
            
            # Use the wrapper here!
            self.dice_explainer = dice_ml.Dice(d, m, method="random")
            
            # Extract Model and Preprocessor
            self.model = self.pipeline.named_steps.get("classifier") or \
                         self.pipeline.named_steps.get("xgb") or \
                         self.pipeline.steps[-1][1]
                         
            preprocessor = self.pipeline.named_steps.get("preprocessor") or \
                           self.pipeline.named_steps.get("columntransformer")
            
            # 2. Initialize SHAP
            self.shap_explainer = shap.TreeExplainer(self.model)
            
            try:
                self.feature_names = preprocessor.get_feature_names_out()
                self.feature_names = [str(n).split("__")[-1] for n in self.feature_names]
            except AttributeError:
                print("Warning: Could not extract feature names from preprocessor.")
            print("✅ Pipeline and SHAP loaded successfully!")

            # 3. Initialize LIME
            if os.path.exists(self.background_data_path):
                X_train_transformed = joblib.load(self.background_data_path)
                if hasattr(X_train_transformed, "toarray"):
                    X_train_transformed = X_train_transformed.toarray()
                elif isinstance(X_train_transformed, pd.DataFrame):
                    X_train_transformed = X_train_transformed.values

                self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
                    training_data=X_train_transformed,
                    feature_names=self.feature_names,
                    class_names=['Approved', 'Default'],
                    mode='classification'
                )
                print("✅ LIME Explainer loaded successfully!")
            else:
                print(f"⚠️ LIME Disabled: Background data '{self.background_data_path}' not found.")
                
        except Exception as e:
            print(f"❌ Error loading pipeline or explainers: {e}")

    def predict_and_explain(self, input_data: dict) -> dict:
        if not self.pipeline:
            raise ValueError("Model pipeline is not loaded.")

        input_df = pd.DataFrame([input_data])
        
        # 1. Prediction
        prediction = self.pipeline.predict(input_df)[0]
        prob_approval = float(self.pipeline.predict_proba(input_df)[0][0])
        prob_default = float(self.pipeline.predict_proba(input_df)[0][1])

        loan_status = "Rejected" if prediction == 1 else "Approved"
        if prob_default > 0.6:
            risk_category = "High Risk"
        elif prob_default > 0.3:
            risk_category = "Moderate Risk"
        else:
            risk_category = "Low Risk"

        # 2. Preprocessing for Explainers
        from custom_transforms import log_income # Ensure local import context
        shap_data = log_income(input_df.copy())
        preprocessor = self.pipeline.named_steps.get("preprocessor") or \
                       self.pipeline.named_steps.get("columntransformer")
        processed_data = preprocessor.transform(shap_data)

        if hasattr(processed_data, "toarray"):
            processed_data = processed_data.toarray()
        elif isinstance(processed_data, pd.DataFrame):
            processed_data = processed_data.values

        # 3. SHAP
        shap_values = self.shap_explainer.shap_values(processed_data)
        if isinstance(shap_values, list):
            shap_instance = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            shap_instance = shap_values[0, :, 1]
        else:
            shap_instance = shap_values[0]

        shap_factors = [
            {
                "feature": name,
                "impact_score": round(float(val), 4),
                "impact_direction": "Increases Default Risk" if val > 0 else "Supports Approval"
            }
            for name, val in zip(self.feature_names, shap_instance)
        ]
        shap_factors.sort(key=lambda x: abs(x["impact_score"]), reverse=True)

        # 4. LIME
        lime_factors = []
        if self.lime_explainer:
            exp = self.lime_explainer.explain_instance(
                data_row=processed_data[0],
                predict_fn=self.model.predict_proba,
                num_features=3
            )
            lime_factors = [
                {
                    "rule": rule,
                    "weight": round(float(weight), 4),
                    "impact": "Increases Default Risk" if weight > 0 else "Supports Approval"
                }
                for rule, weight in exp.as_list()
            ]

        # 5. DiCE Counterfactuals (Only if Rejected)
        counterfactuals = []
        if prediction == 1 and self.dice_explainer:
            try:
                current_income = input_data['person_income']
                current_loan = input_data['loan_amnt']
                current_score = input_data['credit_score']

                # Slightly looser bounds to give DiCE room to find a solution
                permitted_ranges = {
                    'person_income': [current_income, current_income * 1.50], # Up to 50% increase
                    'loan_amnt': [current_loan * 0.25, current_loan],         # Down to 25% of original
                    'credit_score': [current_score, min(current_score + 150, 850)] 
                }

                # Wrap the call so we can time it out
                def generate_cfs():
                    return self.dice_explainer.generate_counterfactuals(
                        input_df, 
                        total_CFs=2, # Reduced to 2 for speed
                        desired_class=0,
                        features_to_vary=['loan_amnt', 'person_income', 'credit_score'],
                        permitted_range=permitted_ranges
                    )

                # Execute with a STRICT 5-second time limit
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(generate_cfs)
                    dice_exp = future.result(timeout=3.0) 
                
                cf_df = dice_exp.cf_examples_list[0].final_cfs_df
                
                for _, row in cf_df.iterrows():
                    changes = []
                    
                    if row['loan_amnt'] < current_loan:
                        reduction = current_loan - row['loan_amnt']
                        if reduction > 500:
                            changes.append(f"Reduce loan amount by ${reduction:,.0f} (to ${row['loan_amnt']:,.0f})")
                    
                    if row['person_income'] > current_income:
                        increase = row['person_income'] - current_income
                        changes.append(f"Increase provable income by ${increase:,.0f}")
                        
                    if row['credit_score'] > current_score:
                        points_needed = row['credit_score'] - current_score
                        changes.append(f"Improve credit score by {points_needed:.0f} points")

                    if 0 < len(changes) <= 2:
                        counterfactuals.append(changes)
                        
                    if len(counterfactuals) >= 2:
                        break

            except concurrent.futures.TimeoutError:
                print("⚠️ DiCE timeout: Application too far from approval threshold.")
                counterfactuals = [
                    ["Application is outside standard approval thresholds for automated suggestions."],
                    ["Please consult a loan officer for a manual review."]
                ]
            except Exception as e:
                print(f"DiCE Error: {e}")

        return {
            "loan_status": loan_status,
            "risk_category": risk_category,
            "probability_of_default": f"{prob_default:.2%}",
            "probability_of_approval": f"{prob_approval:.2%}",
            "explanations": {
                "shap_top_factors": shap_factors[:3],
                "lime_rules": lime_factors if lime_factors else "LIME is disabled."
            },
            "action_plan": counterfactuals
        }