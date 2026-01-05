"""
Lead Schema
Pydantic models for lead management
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    name: Optional[str] = None  # Made optional
    phone: str
    email: Optional[EmailStr] = None
    status: Optional[str] = "new"

class LeadCreate(LeadBase):
    campaign_id: int

class LeadUpdate(LeadBase):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None

class LeadInDBBase(LeadBase):
    id: int
    campaign_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Lead(LeadInDBBase):
    pass