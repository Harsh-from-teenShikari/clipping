from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Boolean
from app.db import Base
import uuid


def cuid():
    return "cuid_" + uuid.uuid4().hex[:10]


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(String, primary_key=True, default=cuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"))
    campaign_id = Column(String, nullable=True)
    content_data = Column(JSON, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected


class Commission(Base):
    __tablename__ = "commissions"
    id = Column(String, primary_key=True, default=cuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"))
    amount = Column(Float, default=0)
    status = Column(String, default="pending")  # pending, paid


class Payout(Base):
    __tablename__ = "payouts"
    id = Column(String, primary_key=True, default=cuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"))
    amount = Column(Float, default=0)
    status = Column(String, default="pending")  # pending, completed


class VerifiedSubmission(Base):
    __tablename__ = "verified_submissions"
    id = Column(String, primary_key=True, default=cuid)
    creator_id = Column(String)
    post_link = Column(String)
    submitter = Column(String)  # user_id
    campaign_id = Column(String)
    passed = Column(Boolean, default=False)
