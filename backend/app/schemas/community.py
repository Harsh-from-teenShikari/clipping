from pydantic import BaseModel
from typing import Optional


class CreateCommunityBody(BaseModel):
    name: str
    description: Optional[str] = None
    photo: Optional[str] = None
    operator_id: str
