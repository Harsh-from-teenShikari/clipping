from fastapi import FastAPI
from app.db import Base, engine
from app.routers.auth import router as auth_router
from app.routers.identity import router as identity_router
from app.routers.campaigns import router as campaigns_router

# Import models to ensure they are registered with Base.metadata before create_all
from app.modules.user import User
from app.modules.creator_profile import CreatorProfile
from app.modules.dashboard_models import Submission, Commission, Payout
from app.modules.campaign import Campaign, AuditLog, CampaignParticipant

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(identity_router)
app.include_router(campaigns_router)