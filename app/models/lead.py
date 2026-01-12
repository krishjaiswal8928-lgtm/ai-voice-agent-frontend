from datetime import datetime
from typing import Optional

class Lead:
    """
    Lead model for Firestore.
    """
    def __init__(
        self,
        campaign_id: str, # Changed to str for Firestore ID
        phone: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        purpose: Optional[str] = None,
        status: str = "new",
        created_at: Optional[datetime] = None,
        id: Optional[str] = None
    ):
        self.id = id
        self.campaign_id = campaign_id
        self.name = name
        self.phone = phone
        self.email = email
        self.purpose = purpose
        self.status = status
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            "campaign_id": self.campaign_id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "purpose": self.purpose,
            "status": self.status,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return Lead(
            id=id,
            campaign_id=source.get("campaign_id"),
            name=source.get("name"),
            phone=source.get("phone"),
            email=source.get("email"),
            purpose=source.get("purpose"),
            status=source.get("status", "new"),
            created_at=source.get("created_at")
        )