import numpy as np

def log_income(X):
    X = X.copy()
    if hasattr(X, "columns") and "person_income" in X.columns:
        X["person_income"] = np.log1p(X["person_income"].astype(float))
    return X