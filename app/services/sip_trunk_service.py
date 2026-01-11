import os
import secrets
import string
from google.cloud import firestore
from typing import List, Optional
from cryptography.fernet import Fernet
import base64

from app.models.sip_trunk import SIPTrunk
from app.schemas.sip_trunk import SIPTrunkCreate, SIPTrunkUpdate

class SIPTrunkService:
    def __init__(self):
        # Get encryption key from environment or generate one
        self.encryption_key = os.getenv('SIP_ENCRYPTION_KEY')
        if not self.encryption_key:
            # In production, this should be stored securely
            self.encryption_key = Fernet.generate_key()
        else:
            self.encryption_key = self.encryption_key.encode()
        
        self.cipher = Fernet(self.encryption_key)
        
        # SIP domain configuration
        self.sip_domain_base = os.getenv('SIP_DOMAIN', 'sip.yourdomain.ai')
        self.sip_port_tcp = int(os.getenv('SIP_PORT_TCP', '5060'))
        self.sip_port_tls = int(os.getenv('SIP_PORT_TLS', '5061'))

    def generate_sip_domain(self, phone_number: str, transport: str = "tcp") -> str:
        """
        Generate our SIP domain that users will configure in their PBX.
        Format: sip:sip.yourdomain.ai:5060 or sip:sip.yourdomain.ai:5061
        """
        port = self.sip_port_tls if transport == "tls" else self.sip_port_tcp
        return f"sip:{self.sip_domain_base}:{port}"

    def encrypt_credential(self, credential: str) -> str:
        """Encrypt sensitive credentials before storing."""
        if not credential:
            return None
        return self.cipher.encrypt(credential.encode()).decode()

    def decrypt_credential(self, encrypted_credential: str) -> str:
        """Decrypt credentials when needed."""
        if not encrypted_credential:
            return None
        return self.cipher.decrypt(encrypted_credential.encode()).decode()

    def create_sip_trunk(
        self,
        db: firestore.Client,
        trunk_data: SIPTrunkCreate,
        user_id: str
    ) -> SIPTrunk:
        """Create a new SIP trunk."""
        # Generate unique ID
        trunk_id = db.collection('sip_trunks').document().id
        
        # Generate SIP domain
        sip_domain = self.generate_sip_domain(
            trunk_data.phone_number,
            trunk_data.inbound_transport
        )
        
        # Encrypt authentication credentials if provided
        encrypted_username = None
        encrypted_password = None
        if trunk_data.auth_username:
            encrypted_username = self.encrypt_credential(trunk_data.auth_username)
        if trunk_data.auth_password:
            encrypted_password = self.encrypt_credential(trunk_data.auth_password)
        
        # Create SIP trunk object
        trunk = SIPTrunk(
            id=trunk_id,
            user_id=user_id,
            phone_number=trunk_data.phone_number,
            label=trunk_data.label,
            sip_domain=sip_domain,
            inbound_transport=trunk_data.inbound_transport,
            inbound_media_encryption=trunk_data.inbound_media_encryption,
            outbound_address=trunk_data.outbound_address,
            outbound_transport=trunk_data.outbound_transport,
            outbound_media_encryption=trunk_data.outbound_media_encryption,
            custom_headers=trunk_data.custom_headers,
            auth_username=encrypted_username,
            auth_password=encrypted_password,
            assigned_agent_id=trunk_data.assigned_agent_id
        )
        
        # Save to Firestore
        db.collection('sip_trunks').document(trunk_id).set(trunk.to_dict())
        
        return trunk

    def get_sip_trunks(self, db: firestore.Client, user_id: str) -> List[SIPTrunk]:
        """Get all SIP trunks for a user."""
        trunks_ref = db.collection('sip_trunks').where('user_id', '==', user_id)
        trunks = []
        
        for doc in trunks_ref.stream():
            trunk_data = doc.to_dict()
            trunk = SIPTrunk.from_dict(trunk_data)
            trunks.append(trunk)
        
        return trunks

    def get_sip_trunk(self, db: firestore.Client, trunk_id: str) -> Optional[SIPTrunk]:
        """Get a specific SIP trunk by ID."""
        doc = db.collection('sip_trunks').document(trunk_id).get()
        
        if not doc.exists:
            return None
        
        return SIPTrunk.from_dict(doc.to_dict())

    def update_sip_trunk(
        self,
        db: firestore.Client,
        trunk_id: str,
        update_data: SIPTrunkUpdate
    ) -> SIPTrunk:
        """Update an existing SIP trunk."""
        trunk_ref = db.collection('sip_trunks').document(trunk_id)
        trunk_doc = trunk_ref.get()
        
        if not trunk_doc.exists:
            raise ValueError("SIP trunk not found")
        
        # Get current trunk data
        current_data = trunk_doc.to_dict()
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        
        # Handle credential encryption
        if 'auth_username' in update_dict and update_dict['auth_username']:
            update_dict['auth_username'] = self.encrypt_credential(update_dict['auth_username'])
        if 'auth_password' in update_dict and update_dict['auth_password']:
            update_dict['auth_password'] = self.encrypt_credential(update_dict['auth_password'])
        
        # Update timestamp
        from datetime import datetime
        update_dict['updated_at'] = datetime.utcnow()
        
        # Merge updates
        current_data.update(update_dict)
        
        # Save to Firestore
        trunk_ref.set(current_data)
        
        return SIPTrunk.from_dict(current_data)

    def delete_sip_trunk(self, db: firestore.Client, trunk_id: str) -> bool:
        """Delete a SIP trunk."""
        db.collection('sip_trunks').document(trunk_id).delete()
        return True

    def get_decrypted_credentials(self, trunk: SIPTrunk) -> dict:
        """Get decrypted credentials for a trunk (for admin/debugging purposes)."""
        return {
            'username': self.decrypt_credential(trunk.auth_username) if trunk.auth_username else None,
            'password': self.decrypt_credential(trunk.auth_password) if trunk.auth_password else None
        }
    
    def get_by_phone_number(self, db: firestore.Client, phone_number: str) -> Optional[SIPTrunk]:
        """
        Get SIP trunk by phone number.
        Used for routing inbound calls.
        
        Args:
            db: Firestore client
            phone_number: Phone number in E.164 format (e.g., +15551234567)
            
        Returns:
            SIPTrunk if found, None otherwise
        """
        trunks_ref = db.collection('sip_trunks')
        query = trunks_ref.where('phone_number', '==', phone_number).where('is_active', '==', True).limit(1)
        
        results = list(query.stream())
        if results:
            return SIPTrunk.from_dict(results[0].to_dict())
        
        return None



# Singleton instance
sip_trunk_service = SIPTrunkService()
