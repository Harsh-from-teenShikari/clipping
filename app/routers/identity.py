from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.modules.creator_profile import CreatorProfile
from app.modules.dashboard_models import Submission, Commission, Payout

router = APIRouter(prefix="/api/v1/identity", tags=["identity"])


@router.get("/dashboard/{creator_id}")
def get_creator_dashboard(creator_id: str, db: Session = Depends(get_db)):

    profile = db.query(CreatorProfile).filter_by(id=creator_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Creator not found")

    total_submissions = db.query(Submission).filter_by(creator_id=creator_id).count()
    approved_submissions = db.query(Submission).filter_by(creator_id=creator_id, status="approved").count()

    approved_commissions = db.query(Commission).filter_by(creator_id=creator_id, status="paid").all()
    available_balance = sum(c.amount for c in approved_commissions)

    pending_payouts = db.query(Payout).filter_by(creator_id=creator_id, status="pending").all()
    pending_payout_amount = sum(p.amount for p in pending_payouts)

    return {
        "profile": {
            "niche": profile.niche,
            "region": profile.region,
            "followers": profile.followers,
            "trust_score": profile.trust_score,
            "kyc_status": profile.kyc_status,
        },
        "stats": {
            "total_submissions": total_submissions,
            "approved_submissions": approved_submissions,
            "pending_payout_amount": pending_payout_amount,
            "available_balance": available_balance,
            "trust_score": profile.trust_score,
        },
    }
