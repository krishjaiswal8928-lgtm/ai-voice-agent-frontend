from typing import Optional, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field

@dataclass
class Integration:
    """
    Represents a third-party service integration (Twilio, Exotel, etc.)
    """
    id: str
    user_id: str
    provider: str  # "twilio", "exotel", "plivo", etc.
    credentials: Dict[str, Any]  # Encrypted storage of API keys/tokens
    status: str  # "connected", "disconnected", "error", "pending"
    connected_at: Optional[datetime] = None
    last_synced: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore storage"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'provider': self.provider,
            'credentials': self.credentials,  # Should be encrypted before storing
            'status': self.status,
            'connected_at': self.connected_at,
            'last_synced': self.last_synced,
            'metadata': self.metadata,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Integration':
        """Create Integration from Firestore document"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            provider=data.get('provider'),
            credentials=data.get('credentials', {}),
            status=data.get('status', 'pending'),
            connected_at=data.get('connected_at'),
            last_synced=data.get('last_synced'),
            metadata=data.get('metadata', {}),
            created_at=data.get('created_at', datetime.utcnow()),
            updated_at=data.get('updated_at', datetime.utcnow())
        )
