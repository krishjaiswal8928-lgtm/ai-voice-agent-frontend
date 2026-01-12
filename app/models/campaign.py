from datetime import datetime
from typing import Optional, List, Union

class CallSession:
    """
    Call Session model for Firestore.
    Represents an organized calling initiative with AI agents.
    """
    def __init__(
        self,
        user_id: Union[int, str],
        name: str,
        type: str,
        status: str = "draft",
        goal: Optional[str] = None,
        custom_agent_id: Optional[Union[int, str]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        id: Optional[str] = None # Firestore IDs are strings
    ):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.type = type
        self.status = status
        self.goal = goal
        self.custom_agent_id = custom_agent_id
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "type": self.type,
            "status": self.status,
            "goal": self.goal,
            "custom_agent_id": self.custom_agent_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return CallSession(
            id=id,
            user_id=source.get("user_id"),
            name=source.get("name"),
            type=source.get("type"),
            status=source.get("status", "draft"),
            goal=source.get("goal"),
            custom_agent_id=source.get("custom_agent_id"),
            created_at=source.get("created_at"),
            updated_at=source.get("updated_at")
        )