from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from app.db import Base
import uuid
from datetime import datetime


def cuid():
    return "cuid_" + uuid.uuid4().hex[:10]


class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(String, primary_key=True, default=cuid)
    name = Column(String)
    type = Column(String)  # CLIPPING, AFFILIATE, SUBSCRIPTION
    status = Column(String, default="draft")
    region = Column(String)
    min_followers = Column(Integer, default=0)
    target_niche = Column(String)
    required_hashtags = Column(JSON, default=[])
    banned_keywords = Column(JSON, default=[])
    reward_pool = Column(Float, default=0)
    target_metric = Column(Integer, default=0)
    target_reward = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=cuid)
    actor_id = Column(String)
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class CampaignParticipant(Base):
    __tablename__ = "campaign_participants"
    id = Column(String, primary_key=True, default=cuid)
    campaign_id = Column(String)
    creator_id = Column(String)
    joined_at = Column(DateTime, default=datetime.utcnow)
