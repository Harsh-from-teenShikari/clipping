from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from app.db import get_db
from app.modules.campaign import Campaign, AuditLog, CampaignParticipant
from app.modules.dashboard_models import Submission
from app.schemas.campaign import CreateCampaignBody, UpdateCampaignBody

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])


@router.post("/", status_code=201)
def create_campaign(body: CreateCampaignBody, db: Session = Depends(get_db)):

    campaign = Campaign(
        name=body.name,
        type=body.type,
        region=body.region,
        min_followers=body.min_followers,
        target_niche=body.target_niche,
        required_hashtags=body.required_hashtags,
        banned_keywords=body.banned_keywords,
        reward_pool=body.reward_pool,
        target_metric=body.target_metric,
        target_reward=body.target_reward,
        platform=body.platform,
        status="draft",
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    audit = AuditLog(
        actor_id="system",
        action="CAMPAIGN_CREATED",
        entity_type="Campaign",
        entity_id=campaign.id,
    )
    db.add(audit)
    db.commit()

    return {
        "id": campaign.id,
        "name": campaign.name,
        "type": campaign.type,
        "status": campaign.status,
        "reward_pool": campaign.reward_pool,
        "created_at": str(campaign.created_at),
    }


@router.get("/")
def get_all_campaigns(
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Campaign)
    if status:
        query = query.filter(Campaign.status == status)
    if type:
        query = query.filter(Campaign.type == type)
    campaigns = query.all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "platform": c.platform,
            "status": c.status,
            "reward_pool": c.reward_pool,
        }
        for c in campaigns
    ]


@router.get("/joined/not-submitted/{creator_id}")
def get_joined_not_submitted(creator_id: str, db: Session = Depends(get_db)):
    participations = db.query(CampaignParticipant).filter_by(creator_id=creator_id).all()
    joined_ids = [p.campaign_id for p in participations]
    
    if not joined_ids:
         return []
         
    submissions = db.query(Submission).filter_by(creator_id=creator_id).all()
    submitted_ids = [s.campaign_id for s in submissions if s.campaign_id]
    
    not_submitted_ids = list(set(joined_ids) - set(submitted_ids))
    
    if not not_submitted_ids:
        return []
        
    campaigns = db.query(Campaign).filter(Campaign.id.in_(not_submitted_ids)).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "platform": c.platform,
            "status": c.status,
            "reward_pool": c.reward_pool,
        }
        for c in campaigns
    ]


@router.get("/{campaign_id}")
def get_campaign_detail(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter_by(id=campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {
        "id": campaign.id,
        "name": campaign.name,
        "type": campaign.type,
        "platform": campaign.platform,
        "status": campaign.status,
        "required_hashtags": campaign.required_hashtags,
        "reward_pool": campaign.reward_pool,
        "joined_creators": campaign.joined_creators or [],
    }


@router.patch("/{campaign_id}/activate")
def activate_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter_by(id=campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.reward_pool <= 0:
        raise HTTPException(status_code=400, detail="Reward pool must be greater than 0")

    campaign.status = "active"
    db.commit()

    return {"id": campaign.id, "status": "active", "message": "Campaign is now live."}


@router.patch("/{campaign_id}/pause")
def pause_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter_by(id=campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "paused"
    db.commit()

    return {"id": campaign.id, "status": "paused"}


@router.post("/{campaign_id}/join", status_code=201)
def join_campaign(campaign_id: str, body: dict, db: Session = Depends(get_db)):
    creator_id = body.get("creator_id")
    if not creator_id:
        raise HTTPException(status_code=400, detail="creator_id is required")

    campaign = db.query(Campaign).filter_by(id=campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "active":
        raise HTTPException(status_code=400, detail="Campaign is not active")

    existing = db.query(CampaignParticipant).filter_by(
        campaign_id=campaign_id, creator_id=creator_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already joined this campaign")

    participant = CampaignParticipant(campaign_id=campaign_id, creator_id=creator_id)
    db.add(participant)
    
    # Update joined_creators list in Campaign model
    if campaign.joined_creators is None:
        campaign.joined_creators = []
    
    if creator_id not in campaign.joined_creators:
        new_list = list(campaign.joined_creators)
        new_list.append(creator_id)
        campaign.joined_creators = new_list
    
    db.commit()
    db.refresh(participant)
    db.refresh(campaign)

    return {"message": "Successfully joined campaign.", "joined_at": str(participant.joined_at)}
