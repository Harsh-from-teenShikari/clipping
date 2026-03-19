from pydantic import BaseModel
from typing import Optional

class SubmissionCreate(BaseModel):
    campaign_id: str
    creator_id: str
    content_url: str

class SubmissionResponse(BaseModel):
    id: str
    campaign_id: str
    status: str
    message: str

class SubmissionReview(BaseModel):
    status: str # approved, rejected
    rejection_reason: Optional[str] = None # op1, op2, op3, op4

class VerifiedSubmissionResponse(BaseModel):
    id: str
    creator_id: str
    post_link: str
    campaign_id: str
    passed: bool
    review_status: Optional[str] = "pending"
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True
