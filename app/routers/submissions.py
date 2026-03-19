from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.modules.dashboard_models import Submission, VerifiedSubmission
from app.modules.campaign import Campaign
from app.schemas.submission import (
    SubmissionCreate, 
    SubmissionResponse, 
    SubmissionReview, 
    VerifiedSubmissionResponse
)
from app.core.ai_service import ai_service
import asyncio

router = APIRouter(prefix="/api/v1/submissions", tags=["submissions"])

@router.post("/", response_model=SubmissionResponse, status_code=201)
async def create_submission(
    body: SubmissionCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Verify campaign exists and status == "active"
    campaign = db.query(Campaign).filter_by(id=body.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "active":
        raise HTTPException(status_code=400, detail="Campaign is not active")

    # 2. Check reward_pool > 0
    if campaign.reward_pool <= 0:
        raise HTTPException(status_code=400, detail="Reward pool exhausted")

    # 3. Persist Submission with status = "pending"
    submission = Submission(
        campaign_id=body.campaign_id,
        creator_id=body.creator_id,
        content_data={"url": body.content_url},
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # 4. Fire-and-forget background task
    background_tasks.add_task(ai_service.evaluate_submission, {
        "submission_id": submission.id,
        "campaign_id": body.campaign_id,
        "content_url": body.content_url,
        "creator_id": body.creator_id
    })

    return {
        "id": submission.id,
        "campaign_id": submission.campaign_id,
        "status": submission.status,
        "message": (
            "Submission received. Our AI is currently parsing your link for view counts. "
            "If it meets the campaign's target metric, it will appear in the 'passed' list for the campaign owner to review."
        )
    }

@router.get("/passed/{campaign_id}", response_model=List[VerifiedSubmissionResponse])
async def get_passed_submissions(campaign_id: str, db: Session = Depends(get_db)):
    """
    Returns all submissions for a campaign that have passed automated verification 
    and are awaiting manual review.
    """
    passed = db.query(VerifiedSubmission).filter(
        VerifiedSubmission.campaign_id == campaign_id,
        VerifiedSubmission.passed == True,
        VerifiedSubmission.review_status == "pending"
    ).all()
    return passed

@router.post("/verify/{verified_id}/review", response_model=VerifiedSubmissionResponse)
async def review_submission(
    verified_id: str, 
    review: SubmissionReview, 
    db: Session = Depends(get_db)
):
    """
    Allows campaign owners to approve or reject a passed submission.
    If rejected, a reason must be provided.
    """
    verified = db.query(VerifiedSubmission).filter(VerifiedSubmission.id == verified_id).first()
    if not verified:
        raise HTTPException(status_code=404, detail="Verified submission not found")
    
    if review.status == "rejected" and not review.rejection_reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required for 'rejected' status")

    verified.review_status = review.status
    if review.status == "rejected":
        verified.rejection_reason = review.rejection_reason
    else:
        verified.rejection_reason = None # Clear reason if approved
        
    db.commit()
    db.refresh(verified)
    return verified