from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GoalBase(BaseModel):
    name: str
    description: str

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    name: Optional[str] = None
    description: Optional[str] = None

class GoalInDBBase(GoalBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Goal(GoalInDBBase):
    pass