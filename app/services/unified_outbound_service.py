"""
Unified Outbound Service
Provides a single interface for making outbound calls via Twilio or SIP trunks.
"""

from typing import Dict, Optional
import logging
import os
from google.cloud import firestore

logger = logging.getLogger(__name__)


class UnifiedOutboundService:
    """
    Provider-agnostic outbound calling service.
    Supports both Twilio numbers and SIP trunks.
    """
    
    def __init__(self):
        self.initialized = False
    
    async def initiate_call(
        self,
        phone_source_id: str,
        to_number: str,
        call_context: Dict,
        db: firestore.Client
    ) -> Dict:
        """
        Initiate outbound call using appropriate provider.
        
        Args:
            phone_source_id: ID of VirtualPhoneNumber (Twilio or SIP)
            to_number: Lead's phone number
            call_context: Campaign, lead, agent context
            db: Firestore client
            
        Returns:
            {
                "success": bool,
                "call_sid": str,
                "provider": "twilio" | "sip",
                "error": str (if failed)
            }
        """
        
        try:
            # 1. Get phone source
            phone_doc = db.collection('virtual_phone_numbers').document(phone_source_id).get()
            if not phone_doc.exists:
                logger.error(f"Phone source {phone_source_id} not found")
                return {"success": False, "error": "Phone source not found"}
            
            from app.models.phone_number import VirtualPhoneNumber
            phone_source = VirtualPhoneNumber.from_dict(phone_doc.to_dict(), phone_doc.id)
            
            # 2. Route based on provider
            if phone_source.provider == 'sip':
                logger.info(f"📞 Routing call via SIP trunk: {phone_source.phone_number}")
                return await self._make_sip_call(phone_source, to_number, call_context, db)
            else:
                logger.info(f"📞 Routing call via Twilio: {phone_source.phone_number}")
                return await self._make_twilio_call(phone_source, to_number, call_context)
                
        except Exception as e:
            logger.error(f"Error initiating call: {e}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    async def _make_twilio_call(
        self,
        phone_source: 'VirtualPhoneNumber',
        to_number: str,
        call_context: Dict
    ) -> Dict:
        """Make call using Twilio"""
        from app.services.outbound_service import outbound_manager
        
        # Ensure Twilio is initialized
        if not outbound_manager.client:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            from_number = phone_source.phone_number
            webhook_base = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
            
            if account_sid and auth_token and from_number and webhook_base:
                webhook_base_url = f"https://{webhook_base}"
                outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base_url)
                logger.info("✅ Twilio initialized for outbound call")
            else:
                return {"success": False, "error": "Twilio credentials not configured"}
        
        # Make the call
        result = await outbound_manager.make_call(to_number, call_context)
        
        if result.get("success"):
            result["provider"] = "twilio"
            logger.info(f"✅ Twilio call initiated: {result.get('call_sid')}")
        else:
            logger.error(f"❌ Twilio call failed: {result.get('error')}")
        
        return result
    
    async def _make_sip_call(
        self,
        phone_source: 'VirtualPhoneNumber',
        to_number: str,
        call_context: Dict,
        db: firestore.Client
    ) -> Dict:
        """Make call using SIP trunk"""
        
        try:
            # Get SIP trunk details
            from app.services.sip_trunk_service import SIPTrunkService
            sip_service = SIPTrunkService(db)
            sip_trunk = sip_service.get_sip_trunk(phone_source.sip_trunk_id)
            
            if not sip_trunk:
                return {"success": False, "error": "SIP trunk not found"}
            
            # Get SIP provider
            from app.services.sip_provider import get_sip_provider
            sip_provider = get_sip_provider(sip_trunk.provider or 'twilio')
            
            # Decrypt credentials
            from app.core.encryption import decrypt_credential
            auth_username = decrypt_credential(sip_trunk.auth_username) if sip_trunk.auth_username else None
            auth_password = decrypt_credential(sip_trunk.auth_password) if sip_trunk.auth_password else None
            
            # Build webhook URL with context
            backend_url = os.getenv('WEBHOOK_BASE_DOMAIN') or os.getenv('BACKEND_BASE_URL')
            if not backend_url:
                return {"success": False, "error": "Backend URL not configured"}
            
            # Ensure proper format
            if not backend_url.startswith('http'):
                backend_url = f"https://{backend_url}"
            
            webhook_url = f"{backend_url}/api/sip/webhook/voice"
            
            # Add context as query params
            from urllib.parse import urlencode
            params = urlencode(call_context)
            webhook_url = f"{webhook_url}?{params}"
            
            logger.info(f"🔗 SIP webhook URL: {webhook_url}")
            
            # Initiate call via SIP provider
            call_result = sip_provider.initiate_outbound_call(
                from_number=sip_trunk.phone_number,
                to_number=to_number,
                sip_domain=sip_trunk.sip_domain,
                auth_username=auth_username,
                auth_password=auth_password,
                webhook_url=webhook_url
            )
            
            if call_result.get("success"):
                call_result["provider"] = "sip"
                logger.info(f"✅ SIP call initiated: {call_result.get('call_sid')}")
            else:
                logger.error(f"❌ SIP call failed: {call_result.get('error')}")
            
            return call_result
            
        except Exception as e:
            logger.error(f"Error making SIP call: {e}", exc_info=True)
            return {"success": False, "error": str(e)}


# Global instance
unified_outbound_service = UnifiedOutboundService()
