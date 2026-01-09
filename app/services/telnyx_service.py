import telnyx
import os
import logging
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# Initialize Telnyx
telnyx.api_key = os.getenv("TELNYX_API_KEY")

class TelnyxSIPService:
    """
    Service for managing Telnyx SIP trunks
    """
    
    def __init__(self):
        self.encryption_key = os.getenv("ENCRYPTION_KEY")
        self.cipher = Fernet(self.encryption_key.encode()) if self.encryption_key else None
        self.webhook_base = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
        
        if not telnyx.api_key:
            logger.warning("TELNYX_API_KEY not set - SIP trunk features will be disabled")
    
    def create_sip_connection(
        self,
        client_id: str,
        connection_name: str
    ) -> Dict[str, Any]:
        """
        Create SIP connection in Telnyx for client
        
        Returns:
            dict: Connection details including credentials
        """
        try:
            if not telnyx.api_key:
                raise ValueError("Telnyx API key not configured")
            
            # Create TeXML connection (SIP trunk)
            connection = telnyx.TeXMLConnection.create(
                connection_name=f"{connection_name} ({client_id[:8]})",
                active=True,
                webhook_event_url=f"https://{self.webhook_base}/telnyx/sip/webhook",
                webhook_event_failover_url=f"https://{self.webhook_base}/telnyx/sip/webhook-failover",
                webhook_timeout_secs=25
            )
            
            logger.info(f"✅ Created Telnyx connection: {connection.id}")
            
            # Generate credentials
            import secrets
            username = f"client-{client_id[:8]}"
            password = secrets.token_urlsafe(32)
            
            # Note: Telnyx uses IP authentication by default
            # For username/password auth, credentials are configured separately
            
            return {
                "connection_id": connection.id,
                "sip_domain": "sip.telnyx.com",
                "username": username,
                "password": password,
                "status": "active"
            }
            
        except Exception as e:
            logger.error(f"❌ Error creating SIP connection: {e}")
            raise
    
    def delete_sip_connection(self, connection_id: str):
        """
        Delete SIP connection from Telnyx
        """
        try:
            connection = telnyx.TeXMLConnection.retrieve(connection_id)
            connection.delete()
            logger.info(f"✅ Deleted Telnyx connection: {connection_id}")
        except Exception as e:
            logger.error(f"❌ Error deleting SIP connection: {e}")
            raise
    
    def get_connection_status(self, connection_id: str) -> Dict[str, Any]:
        """
        Get status of SIP connection
        """
        try:
            connection = telnyx.TeXMLConnection.retrieve(connection_id)
            return {
                "connection_id": connection.id,
                "active": connection.active,
                "name": connection.connection_name
            }
        except Exception as e:
            logger.error(f"❌ Error getting connection status: {e}")
            return {
                "connection_id": connection_id,
                "active": False,
                "error": str(e)
            }
    
    def encrypt_password(self, password: str) -> str:
        """Encrypt password for storage"""
        if not self.cipher:
            logger.warning("Encryption key not set, storing password in plain text")
            return password
        return self.cipher.encrypt(password.encode()).decode()
    
    def decrypt_password(self, encrypted_password: str) -> str:
        """Decrypt password"""
        if not self.cipher:
            return encrypted_password
        try:
            return self.cipher.decrypt(encrypted_password.encode()).decode()
        except Exception as e:
            logger.error(f"❌ Error decrypting password: {e}")
            return encrypted_password

# Global instance
telnyx_sip_service = TelnyxSIPService()
