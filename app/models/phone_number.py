from datetime import datetime
from typing import Dict, List, Optional, Any

class VirtualPhoneNumber:
    def __init__(
        self,
        id: str,
        user_id: str,
        phone_number: str,
        provider: str,
        credentials: Dict[str, Any],
        display_name: Optional[str] = None,
        is_active: bool = True,
        assigned_agents: List[str] = None,
        created_at: datetime = None,
        updated_at: datetime = None
    ):
        self.id = id
        self.user_id = user_id
        self.phone_number = phone_number
        self.provider = provider
        self.credentials = credentials
        self.display_name = display_name or phone_number
        self.is_active = is_active
        self.assigned_agents = assigned_agents or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @staticmethod
    def from_dict(source: Dict[str, Any]) -> 'VirtualPhoneNumber':
        return VirtualPhoneNumber(
            id=source.get('id'),
            user_id=source.get('user_id'),
            phone_number=source.get('phone_number'),
            provider=source.get('provider'),
            credentials=source.get('credentials', {}),
            display_name=source.get('display_name'),
            is_active=source.get('is_active', True),
            assigned_agents=source.get('assigned_agents', []),
            created_at=source.get('created_at'),
            updated_at=source.get('updated_at')
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phone_number': self.phone_number,
            'provider': self.provider,
            'credentials': self.credentials,
            'display_name': self.display_name,
            'is_active': self.is_active,
            'assigned_agents': self.assigned_agents,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
