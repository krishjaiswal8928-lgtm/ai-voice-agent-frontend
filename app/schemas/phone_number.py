from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class ProviderType(str, Enum):
    TWILIO = "twilio"
    EXOTEL = "exotel"
    KNOWLARITY = "knowlarity"
    SIP = "sip"

class VirtualPhoneNumberBase(BaseModel):
    phone_number: str
    provider: ProviderType
    display_name: Optional[str] = None
    credentials: Dict[str, Any]
    is_active: bool = True

class VirtualPhoneNumberCreate(VirtualPhoneNumberBase):
    pass

class VirtualPhoneNumberUpdate(BaseModel):
    phone_number: Optional[str] = None
    display_name: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    assigned_agents: Optional[List[str]] = None

class VirtualPhoneNumberResponse(VirtualPhoneNumberBase):
    id: str
    user_id: str
    assigned_agents: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
