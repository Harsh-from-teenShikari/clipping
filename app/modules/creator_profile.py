from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db import Base
import uuid
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

def cuid():
    return "cuid_" + uuid.uuid4().hex[:10]

class CreatorProfile(Base):
    __tablename__ = "creator_profiles"
    id = Column(String, primary_key=True, default=cuid)
    user_id = Column(String, ForeignKey("users.id"))
    niche = Column(String)
    region = Column(String)
    followers = Column(Integer, default=0)
    trust_score = Column(Float, default=0.0)
    kyc_status = Column(String, default="unverified")