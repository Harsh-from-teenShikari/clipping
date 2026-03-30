from pydantic import BaseModel
from typing import Optional

class UpdateCreatorProfileBody(BaseModel):
    bio: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
