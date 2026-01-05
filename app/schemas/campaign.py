from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from enum import Enum

class CampaignType(str, Enum):
    OUTBOUND = "outbound"
    INBOUND = "inbound"

class CampaignBase(BaseModel):
    name: str
    type: CampaignType
    goal: Optional[str] = None
    custom_agent_id: Optional[Union[int, str]] = None  # Add custom agent ID

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(CampaignBase):
    name: Optional[str] = None
    type: Optional[CampaignType] = None
    status: Optional[str] = None
    goal: Optional[str] = None
    custom_agent_id: Optional[Union[int, str]] = None  # Add custom agent ID

class CampaignInDBBase(CampaignBase):
    id: str  # Firestore IDs are strings
    user_id: Union[int, str]  # Accept both int and str for compatibility
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # Updated from orm_mode to from_attributes

class Campaign(CampaignInDBBase):
    pass