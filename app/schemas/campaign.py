from pydantic import BaseModel
from typing import Literal, Optional


class CreateCampaignBody(BaseModel):
    name: str
    type: Literal["CLIPPING", "AFFILIATE", "SUBSCRIPTION"]
    region: str
    min_followers: int = 0
    target_niche: str
    required_hashtags: list[str] = []
    banned_keywords: list[str] = []
    reward_pool: float = 0
    target_metric: int = 0
    target_reward: float = 0


class UpdateCampaignBody(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    min_followers: Optional[int] = None
    target_niche: Optional[str] = None
    required_hashtags: Optional[list[str]] = None
    banned_keywords: Optional[list[str]] = None
    reward_pool: Optional[float] = None
    target_metric: Optional[int] = None
    target_reward: Optional[float] = None
