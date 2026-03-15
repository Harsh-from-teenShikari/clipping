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
