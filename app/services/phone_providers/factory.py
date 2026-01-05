from typing import Dict, Any
from .base import BasePhoneProvider
from .exotel import ExotelProvider
from .twilio import TwilioProvider

class ProviderFactory:
    @staticmethod
    def get_provider(provider_type: str, config: Dict[str, Any]) -> BasePhoneProvider:
        """
        Factory method to get the correct provider instance.
        """
        if provider_type == "exotel":
            return ExotelProvider(config)
        elif provider_type == "twilio":
            return TwilioProvider(config)
        # Add more providers here
        else:
            raise ValueError(f"Unsupported provider type: {provider_type}")
