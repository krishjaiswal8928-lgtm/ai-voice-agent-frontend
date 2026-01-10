from datetime import datetime
from typing import Dict, List, Optional, Any

class SIPTrunk:
    def __init__(
        self,
        id: str,
        user_id: str,
        phone_number: str,
        label: str,
        # Inbound settings (calls TO us)
        sip_domain: str,
        inbound_transport: str = "tcp",
        inbound_media_encryption: str = "disabled",
        # Outbound settings (calls FROM us to user's PBX)
        outbound_address: str = None,
        outbound_transport: str = "tcp",
        outbound_media_encryption: str = "disabled",
        custom_headers: Dict[str, str] = None,
        # Authentication (optional)
        auth_username: Optional[str] = None,
        auth_password: Optional[str] = None,
        # Agent assignment
        assigned_agent_id: Optional[str] = None,
        is_active: bool = True,
        # Connection status (ElevenLabs model)
        connection_status: str = "pending",
        last_connected_at: datetime = None,
        last_checked_at: datetime = None,
        error_message: Optional[str] = None,
        created_at: datetime = None,
        updated_at: datetime = None
    ):
        self.id = id
        self.user_id = user_id
        self.phone_number = phone_number
        self.label = label
        
        # Inbound settings
        self.sip_domain = sip_domain
        self.inbound_transport = inbound_transport
        self.inbound_media_encryption = inbound_media_encryption
        
        # Outbound settings
        self.outbound_address = outbound_address
        self.outbound_transport = outbound_transport
        self.outbound_media_encryption = outbound_media_encryption
        self.custom_headers = custom_headers or {}
        
        # Authentication
        self.auth_username = auth_username
        self.auth_password = auth_password
        
        # Agent assignment
        self.assigned_agent_id = assigned_agent_id
        self.is_active = is_active
        
        # Connection status monitoring (ElevenLabs model)
        self.connection_status = connection_status or "pending"  # pending, connected, disconnected, error
        self.last_connected_at = last_connected_at
        self.last_checked_at = last_checked_at
        self.error_message = error_message
        
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @staticmethod
    def from_dict(source: Dict[str, Any]) -> 'SIPTrunk':
        return SIPTrunk(
            id=source.get('id'),
            user_id=source.get('user_id'),
            phone_number=source.get('phone_number'),
            label=source.get('label'),
            sip_domain=source.get('sip_domain'),
            inbound_transport=source.get('inbound_transport', 'tcp'),
            inbound_media_encryption=source.get('inbound_media_encryption', 'disabled'),
            outbound_address=source.get('outbound_address'),
            outbound_transport=source.get('outbound_transport', 'tcp'),
            outbound_media_encryption=source.get('outbound_media_encryption', 'disabled'),
            custom_headers=source.get('custom_headers', {}),
            auth_username=source.get('auth_username'),
            auth_password=source.get('auth_password'),
            assigned_agent_id=source.get('assigned_agent_id'),
            is_active=source.get('is_active', True),
            connection_status=source.get('connection_status', 'pending'),
            last_connected_at=source.get('last_connected_at'),
            last_checked_at=source.get('last_checked_at'),
            error_message=source.get('error_message'),
            created_at=source.get('created_at'),
            updated_at=source.get('updated_at')
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phone_number': self.phone_number,
            'label': self.label,
            'sip_domain': self.sip_domain,
            'inbound_transport': self.inbound_transport,
            'inbound_media_encryption': self.inbound_media_encryption,
            'outbound_address': self.outbound_address,
            'outbound_transport': self.outbound_transport,
            'outbound_media_encryption': self.outbound_media_encryption,
            'custom_headers': self.custom_headers,
            'auth_username': self.auth_username,
            'auth_password': self.auth_password,
            'assigned_agent_id': self.assigned_agent_id,
            'is_active': self.is_active,
            'connection_status': self.connection_status,
            'last_connected_at': self.last_connected_at,
            'last_checked_at': self.last_checked_at,
            'error_message': self.error_message,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
