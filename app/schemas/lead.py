from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime

class LeadBase(BaseModel):
    name: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    purpose: Optional[str] = None

class LeadCreate(LeadBase):
    campaign_id: Union[int, str]  # Accept both int and str for compatibility

class LeadUpdate(LeadBase):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None

class LeadInDBBase(LeadBase):
    id: str  # Firestore IDs are strings
    campaign_id: Union[int, str]  # Accept both int and str for compatibility
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class Lead(LeadInDBBase):
    pass