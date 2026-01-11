"""
Call Session Model

Tracks individual call sessions for SIP trunks.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any


@dataclass
class CallSession:
    """Represents a call session"""
    
    id: str  # Call SID from provider
    sip_trunk_id: str
    agent_id: str
    phone_number: str
    direction: str  # 'inbound' or 'outbound'
    status: str  # initiated, ringing, in-progress, completed, failed, etc.
    provider_call_id: str
    from_address: str
    to_address: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {
            'id': self.id,
            'sip_trunk_id': self.sip_trunk_id,
            'agent_id': self.agent_id,
            'phone_number': self.phone_number,
            'direction': self.direction,
            'status': self.status,
            'provider_call_id': self.provider_call_id,
            'from_address': self.from_address,
            'to_address': self.to_address,
            'started_at': self.started_at,
            'ended_at': self.ended_at,
            'duration_seconds': self.duration_seconds,
            'error_message': self.error_message,
            'metadata': self.metadata or {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CallSession':
        """Create from Firestore dictionary"""
        return cls(
            id=data['id'],
            sip_trunk_id=data['sip_trunk_id'],
            agent_id=data['agent_id'],
            phone_number=data['phone_number'],
            direction=data['direction'],
            status=data['status'],
            provider_call_id=data['provider_call_id'],
            from_address=data['from_address'],
            to_address=data['to_address'],
            started_at=data['started_at'],
            ended_at=data.get('ended_at'),
            duration_seconds=data.get('duration_seconds'),
            error_message=data.get('error_message'),
            metadata=data.get('metadata', {})
        )
