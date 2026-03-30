from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.modules.community import Community
from app.schemas.community import CreateCommunityBody

router = APIRouter(prefix="/api/v1/communities", tags=["communities"])


@router.post("/", status_code=201)
def create_community(body: CreateCommunityBody, db: Session = Depends(get_db)):
    community = Community(
        name=body.name,
        description=body.description,
        photo=body.photo,
        operator_id=body.operator_id,
    )
    db.add(community)
    db.commit()
    db.refresh(community)

    return {
        "id": community.id,
        "name": community.name,
        "description": community.description,
        "photo": community.photo,
        "operator_id": community.operator_id,
    }


@router.get("/")
def get_all_communities(db: Session = Depends(get_db)):
    communities = db.query(Community).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "photo": c.photo,
            "operator_id": c.operator_id,
        }
        for c in communities
    ]


@router.get("/{community_id}")
def get_community(community_id: str, db: Session = Depends(get_db)):
    community = db.query(Community).filter_by(id=community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return {
        "id": community.id,
        "name": community.name,
        "description": community.description,
        "photo": community.photo,
        "operator_id": community.operator_id,
    }
