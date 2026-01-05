from datetime import datetime
from typing import Optional

class Conversation:
    """
    Conversation model for Firestore.
    """
    def __init__(
        self,
        transcript: str,
        client_id: Optional[str] = None,
        lead_id: Optional[str] = None,
        goal_id: Optional[str] = None,
        campaign_id: Optional[str] = None,
        ai_response: Optional[str] = None,
        audio_url: Optional[str] = None,
        duration: Optional[int] = None,
        status: str = "completed",
        created_at: Optional[datetime] = None,
        id: Optional[str] = None
    ):
        self.id = id
        self.client_id = client_id
        self.lead_id = lead_id
        self.goal_id = goal_id
        self.campaign_id = campaign_id
        self.transcript = transcript
        self.ai_response = ai_response
        self.audio_url = audio_url
        self.duration = duration
        self.status = status
        self.created_at = created_at or datetime.now()
        
        # Relationships (populated manually if needed)
        self.lead = None
        self.campaign = None

    def to_dict(self):
        return {
            "client_id": self.client_id,
            "lead_id": self.lead_id,
            "goal_id": self.goal_id,
            "campaign_id": self.campaign_id,
            "transcript": self.transcript,
            "ai_response": self.ai_response,
            "audio_url": self.audio_url,
            "duration": self.duration,
            "status": self.status,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return Conversation(
            id=id,
            client_id=source.get("client_id"),
            lead_id=source.get("lead_id"),
            goal_id=source.get("goal_id"),
            campaign_id=source.get("campaign_id"),
            transcript=source.get("transcript"),
            ai_response=source.get("ai_response"),
            audio_url=source.get("audio_url"),
            duration=source.get("duration"),
            status=source.get("status", "completed"),
            created_at=source.get("created_at")
        )