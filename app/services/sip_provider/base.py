"""
Base SIP Provider Interface

Defines the abstract interface that all SIP providers must implement.
This allows switching between providers (Twilio, Telnyx, custom) without code changes.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime


class BaseSIPProvider(ABC):
    """Abstract base class for SIP providers"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize provider with configuration
        
        Args:
            config: Provider-specific configuration dictionary
        """
        self.config = config
    
    @abstractmethod
    def configure_domain(self, domain_name: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Configure SIP domain for receiving calls
        
        Args:
            domain_name: Domain name (e.g., 'speaksynthai')
            settings: Domain configuration settings
            
        Returns:
            Dict containing domain details (domain_sid, full_domain, etc.)
        """
        pass
    
    @abstractmethod
    def handle_inbound_call(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming call webhook from provider
        
        Args:
            request_data: Raw webhook request data from provider
            
        Returns:
            Standardized call data:
            {
                'call_id': str,
                'from': str,
                'to': str,
                'phone_number': str (extracted E.164),
                'direction': 'inbound',
                'status': str
            }
        """
        pass
    
    @abstractmethod
    def initiate_outbound_call(
        self,
        from_number: str,
        to_sip_address: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Initiate outbound call through user's PBX
        
        Args:
            from_number: Caller ID (E.164 format)
            to_sip_address: Destination SIP address (e.g., 'sip:+1999@pbx.com')
            settings: Call settings including auth, transport, etc.
            
        Returns:
            Dict containing:
            {
                'call_id': str,
                'status': str,
                'provider_call_id': str
            }
        """
        pass
    
    @abstractmethod
    def generate_call_instructions(
        self,
        agent_id: str,
        call_data: Dict[str, Any],
        websocket_url: str
    ) -> str:
        """
        Generate provider-specific call routing instructions
        
        Args:
            agent_id: ID of agent to handle call
            call_data: Call metadata
            websocket_url: WebSocket URL for media streaming
            
        Returns:
            Provider-specific markup (TwiML for Twilio, TeXML for Telnyx, etc.)
        """
        pass
    
    @abstractmethod
    def generate_error_instructions(self, error_message: str) -> str:
        """
        Generate provider-specific error response
        
        Args:
            error_message: Human-readable error message
            
        Returns:
            Provider-specific markup for error handling
        """
        pass
    
    @abstractmethod
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get current status of a call
        
        Args:
            call_id: Provider's call ID
            
        Returns:
            Dict containing:
            {
                'call_id': str,
                'status': str (initiated, ringing, in-progress, completed, failed),
                'duration': int (seconds),
                'start_time': datetime,
                'end_time': datetime (optional)
            }
        """
        pass
    
    @abstractmethod
    def validate_webhook(self, request_data: Dict[str, Any], signature: str) -> bool:
        """
        Validate webhook authenticity
        
        Args:
            request_data: Webhook request data
            signature: Signature from provider
            
        Returns:
            True if valid, False otherwise
        """
        pass
    
    @abstractmethod
    def send_sip_options(self, sip_address: str, timeout: int = 5) -> Dict[str, Any]:
        """
        Send SIP OPTIONS request to check PBX health
        
        Args:
            sip_address: SIP address to check (e.g., 'pbx.company.com')
            timeout: Timeout in seconds
            
        Returns:
            Dict containing:
            {
                'success': bool,
                'latency_ms': int,
                'error': str (optional),
                'capabilities': list (optional)
            }
        """
        pass
    
    def extract_phone_number(self, sip_uri: str) -> Optional[str]:
        """
        Extract phone number from SIP URI and normalize to E.164
        
        Args:
            sip_uri: SIP URI (e.g., 'sip:+15551234567@domain.com')
            
        Returns:
            Phone number in E.164 format or None
        """
        import re
        
        # Remove sip: prefix
        uri = sip_uri.replace('sip:', '').replace('SIP:', '')
        
        # Extract username part (before @)
        if '@' in uri:
            username = uri.split('@')[0]
        else:
            username = uri
        
        # Remove any non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', username)
        
        # Ensure it starts with +
        if not cleaned.startswith('+'):
            # Assume US number if no country code
            if len(cleaned) == 10:
                cleaned = '+1' + cleaned
            elif len(cleaned) == 11 and cleaned.startswith('1'):
                cleaned = '+' + cleaned
            else:
                cleaned = '+' + cleaned
        
        # Validate E.164 format (+ followed by 1-15 digits)
        if re.match(r'^\+\d{1,15}$', cleaned):
            return cleaned
        
        return None
