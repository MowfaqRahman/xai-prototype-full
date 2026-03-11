from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Application, AIDecision
from schemas import OfficerDecision
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    """
    Aggregates high-level metrics for the loan officer dashboard.
    Uses database-side computation (func) for maximum performance.
    """
    try:
        # 1. Volume Metrics
        total_applications = db.query(Application).count()
        
        # 2. Status Counts
        approved_count = db.query(AIDecision).filter(AIDecision.final_status == "Approved").count()
        rejected_count = db.query(AIDecision).filter(AIDecision.final_status == "Rejected").count()
        pending_count = db.query(AIDecision).filter(AIDecision.final_status == "Pending").count()

        # 3. Financial Exposure (Join tables to sum the loan amounts of approved apps)
        total_approved_value = db.query(func.sum(Application.loan_amnt)).join(
            AIDecision, Application.id == AIDecision.application_id
        ).filter(AIDecision.final_status == "Approved").scalar()
        
        # Handle None if there are no approved loans yet
        total_approved_value = total_approved_value or 0.0

        # 4. Average Risk Profile
        avg_risk = db.query(func.avg(AIDecision.probability_of_default)).scalar()
        avg_risk = avg_risk or 0.0

        # 5. Safe Math for Rates
        approval_rate = 0.0
        if total_applications > 0:
            # We calculate rate based on resolved applications (Approved + Rejected)
            resolved_cases = approved_count + rejected_count
            if resolved_cases > 0:
                approval_rate = (approved_count / resolved_cases) * 100

        return {
            "total_applications": total_applications,
            "pending_reviews": pending_count,
            "approval_rate": round(approval_rate, 1),
            "approved_count": approved_count,
            "rejected_count": rejected_count,
            "total_approved_value": round(total_approved_value, 2),
            "average_portfolio_risk": round(avg_risk * 100, 1) # Converted to percentage
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to aggregate KPIs")


@router.get("/queue")
def get_review_queue(db: Session = Depends(get_db)):
    """
    Fetches the list of applications currently waiting for manual officer review.
    """
    try:
        # Fetch applications where final_status is 'Pending'
        # Order by oldest first so the officer works chronologically
        pending_cases = db.query(Application, AIDecision).join(
            AIDecision, Application.id == AIDecision.application_id
        ).filter(
            AIDecision.final_status == "Pending"
        ).order_by(Application.created_at.asc()).all()

        results = []
        for app, dec in pending_cases:
            results.append({
                "application_id": str(app.id),
                "created_at": app.created_at.isoformat(),
                "applicant_income": app.person_income,
                "requested_loan": app.loan_amnt,
                "ai_probability_of_default": f"{round(dec.probability_of_default * 100, 2)}%",
                "credit_score": app.credit_score,
                "intent": app.loan_intent,
                "shap_explanations": dec.shap_explanations,
                "lime_rules": dec.lime_rules,
                "action_plan": dec.action_plan
            })
            
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch review queue")
    
@router.post("/applications/{application_id}/decision")
def submit_manual_decision(
    application_id: str, 
    payload: OfficerDecision, 
    db: Session = Depends(get_db)
):
    """
    Submits a human loan officer's final decision, overriding the AI's "Pending" status.
    Maintains a strict audit log of who made the decision and why.
    """
    try:
        # 1. Find the specific AI Decision record linked to this application
        decision_record = db.query(AIDecision).filter(
            AIDecision.application_id == application_id
        ).first()

        if not decision_record:
            raise HTTPException(status_code=404, detail="Application not found.")

        # 2. Race Condition Protection
        # If the status is no longer "Pending", another officer already handled it.
        if decision_record.final_status != "Pending":
            raise HTTPException(
                status_code=400, 
                detail=f"This application was already resolved ({decision_record.final_status})."
            )

        # 3. Apply the Officer's Override
        decision_record.final_status = payload.decision
        decision_record.reviewed_by_officer = payload.officer_name
        decision_record.override_reason = payload.override_reason
        decision_record.reviewed_at = datetime.utcnow()

        # 4. Save to Database
        db.commit()
        db.refresh(decision_record)

        return {
            "message": f"Application successfully marked as {payload.decision}.",
            "application_id": application_id,
            "new_status": decision_record.final_status,
            "audit_timestamp": decision_record.reviewed_at
        }

    except HTTPException:
        raise # Pass our custom HTTP exceptions through cleanly
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to save officer decision.")