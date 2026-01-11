"""
SIP Provider Abstraction Layer

This module provides a provider-agnostic interface for SIP functionality.
Supports multiple providers (Twilio, Telnyx, custom) through a factory pattern.
"""

from .factory import get_sip_provider
from .base import BaseSIPProvider

__all__ = ['get_sip_provider', 'BaseSIPProvider']
