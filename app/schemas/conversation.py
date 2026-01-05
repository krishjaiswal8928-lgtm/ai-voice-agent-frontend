from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConversationBase(BaseModel):
    transcript: Optional[str] = None
    ai_response: Optional[str] = None
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    status: Optional[str] = "completed"

class ConversationCreate(ConversationBase):
    client_id: int
    lead_id: Optional[int] = None
    goal_id: Optional[int] = None
    campaign_id: Optional[int] = None

class ConversationUpdate(ConversationBase):
    transcript: Optional[str] = None
    ai_response: Optional[str] = None
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    status: Optional[str] = None

class ConversationInDBBase(ConversationBase):
    id: int
    client_id: int
    lead_id: Optional[int] = None
    goal_id: Optional[int] = None
    campaign_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Conversation(ConversationInDBBase):
    pass