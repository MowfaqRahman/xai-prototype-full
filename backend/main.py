import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import __main__

# Import your new modules
from schemas import LoanApplication
from ml_service import MLExplainabilityService
from custom_transforms import log_income

# Inject custom function for joblib to locate it properly during unpickling
setattr(__main__, "log_income", log_income)

ml_service = MLExplainabilityService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models when server starts
    ml_service.load_resources()
    yield
    # Clean up resources when server stops if needed
    ml_service.pipeline = None

app = FastAPI(title="Loan Risk Assessment API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(application: LoanApplication):
    if not ml_service.pipeline:
        raise HTTPException(status_code=503, detail="Model pipeline is not loaded.")
    
    try:
        input_data = application.model_dump()
        
        safe_income = max(input_data["person_income"], 1)
        input_data["loan_percent_income"] = input_data["loan_amnt"] / safe_income
        return ml_service.predict_and_explain(input_data)
    except ValueError as ve:
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)