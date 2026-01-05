from datetime import datetime
from typing import Optional

class User:
    """
    User model for Firestore.
    """
    def __init__(
        self,
        username: str,
        email: str,
        hashed_password: Optional[str] = None,
        is_active: int = 1,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        id: Optional[str] = None,
        google_id: Optional[str] = None,
        auth_provider: str = "email",
        profile_picture: Optional[str] = None
    ):
        self.id = id
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.is_active = is_active
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.google_id = google_id
        self.auth_provider = auth_provider
        self.profile_picture = profile_picture

    def to_dict(self):
        data = {
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "auth_provider": self.auth_provider
        }
        # Only include hashed_password if it exists (not for OAuth users)
        if self.hashed_password:
            data["hashed_password"] = self.hashed_password
        # Include optional OAuth fields if they exist
        if self.google_id:
            data["google_id"] = self.google_id
        if self.profile_picture:
            data["profile_picture"] = self.profile_picture
        return data

    @staticmethod
    def from_dict(source: dict, id: str):
        return User(
            id=id,
            username=source.get("username"),
            email=source.get("email"),
            hashed_password=source.get("hashed_password"),
            is_active=source.get("is_active", 1),
            created_at=source.get("created_at"),
            updated_at=source.get("updated_at"),
            google_id=source.get("google_id"),
            auth_provider=source.get("auth_provider", "email"),
            profile_picture=source.get("profile_picture")
        )