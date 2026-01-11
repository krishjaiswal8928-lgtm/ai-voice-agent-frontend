"""
SIP Provider Factory

Factory pattern to select and instantiate the appropriate SIP provider
based on environment configuration.
"""

import os
from typing import Optional
from .base import BaseSIPProvider


def get_sip_provider() -> BaseSIPProvider:
    """
    Get SIP provider instance based on VOICE_PROVIDER environment variable
    
    Returns:
        Instance of appropriate SIP provider
        
    Raises:
        ValueError: If provider is not configured or unsupported
    """
    provider_name = os.getenv('VOICE_PROVIDER', 'twilio').lower()
    
    if provider_name == 'twilio':
        from .twilio import TwilioSIPProvider
        
        config = {
            'account_sid': os.getenv('TWILIO_ACCOUNT_SID'),
            'auth_token': os.getenv('TWILIO_AUTH_TOKEN'),
            'sip_domain': os.getenv('TWILIO_SIP_DOMAIN'),
            'sip_domain_sid': os.getenv('TWILIO_SIP_DOMAIN_SID'),
            'backend_url': os.getenv('BACKEND_BASE_URL'),
            'websocket_url': os.getenv('WEBSOCKET_BASE_URL')
        }
        
        # Validate required config
        if not config['account_sid'] or not config['auth_token']:
            raise ValueError(
                "Twilio provider requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN "
                "environment variables"
            )
        
        return TwilioSIPProvider(config)
    
    elif provider_name == 'telnyx':
        # Future: Implement Telnyx provider
        raise NotImplementedError("Telnyx provider not yet implemented")
    
    elif provider_name == 'custom':
        # Future: Implement custom SIP provider
        raise NotImplementedError("Custom SIP provider not yet implemented")
    
    else:
        raise ValueError(
            f"Unsupported SIP provider: {provider_name}. "
            f"Supported providers: twilio, telnyx, custom"
        )


def get_provider_name() -> str:
    """
    Get the name of the currently configured provider
    
    Returns:
        Provider name (e.g., 'twilio', 'telnyx')
    """
    return os.getenv('VOICE_PROVIDER', 'twilio').lower()
