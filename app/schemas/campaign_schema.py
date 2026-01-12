"""
Call Session Schema
Pydantic models for call session management
"""

from pydantic import BaseModel, validator
from typing import Optional, Union
from datetime import datetime
from enum import Enum

class CallSessionType(str, Enum):
    OUTBOUND = "outbound"
    INBOUND = "inbound"

class CallSessionBase(BaseModel):
    name: str
    type: CallSessionType
    goal: Optional[str] = None
    rag_document_id: Optional[str] = None  # Changed from int to str for Firestore
    custom_agent_id: Optional[str] = None  # Added for Firestore compatibility
    phone_number_id: Optional[str] = None  # Phone source (Twilio or SIP trunk)
    
    @validator('type', pre=True)
    def validate_call_session_type(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class CallSessionCreate(CallSessionBase):
    pass

class CallSessionUpdate(CallSessionBase):
    name: Optional[str] = None
    type: Optional[CallSessionType] = None
    status: Optional[str] = None
    goal: Optional[str] = None
    rag_document_id: Optional[str] = None  # Changed from int to str
    custom_agent_id: Optional[str] = None
    phone_number_id: Optional[str] = None

class CallSessionInDBBase(CallSessionBase):
    id: str  # Changed from int to str for Firestore
    user_id: str  # Changed from int to str for Firestore
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        # This will help with enum serialization
        use_enum_values = True

class CallSession(CallSessionInDBBase):
    pass