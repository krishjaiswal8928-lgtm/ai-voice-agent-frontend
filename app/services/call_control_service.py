"""
Unified Call Control Service
Provides a single interface for call control operations across all phone providers (Twilio, SIP, etc.)
"""

import logging
from typing import Dict, Any, Optional
from app.services.phone_providers.factory import PhoneProviderFactory

logger = logging.getLogger(__name__)


class CallControlService:
    """
    Unified service for call control operations.
    Automatically routes to the correct provider (Twilio, SIP, etc.)
    """
    
    @staticmethod
    def _get_provider(provider_type: str, provider_config: Dict[str, Any]):
        """Get phone provider instance."""
        return PhoneProviderFactory.create_provider(provider_type, provider_config)
    
    # ===== CALL ENDING =====
    
    @staticmethod
    def end_call(call_id: str, provider_type: str, provider_config: Dict[str, Any], 
                reason: Optional[str] = None) -> bool:
        """
        End call regardless of provider.
        
        Args:
            call_id: Call identifier (provider-specific)
            provider_type: 'twilio', 'sip', etc.
            provider_config: Provider configuration dict
            reason: Optional reason for ending call
            
        Returns:
            bool: True if successful
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            
            if reason:
                logger.info(f"Ending call {call_id} with reason: {reason}")
            
            return provider.end_call(call_id)
        except Exception as e:
            logger.error(f"Failed to end call {call_id}: {str(e)}")
            return False
    
    @staticmethod
    def end_call_with_message(call_id: str, provider_type: str, provider_config: Dict[str, Any],
                             goodbye_message: str) -> bool:
        """
        End call after playing a goodbye message.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            goodbye_message: Message to play before hanging up
            
        Returns:
            bool: True if successful
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            
            # Check if provider supports end_call_with_message
            if hasattr(provider, 'end_call_with_message'):
                return provider.end_call_with_message(call_id, goodbye_message)
            else:
                # Fallback: just end the call
                logger.warning(f"Provider {provider_type} doesn't support end_call_with_message, using regular end_call")
                return provider.end_call(call_id)
        except Exception as e:
            logger.error(f"Failed to end call with message: {str(e)}")
            return False
    
    # ===== CALL TRANSFER =====
    
    @staticmethod
    def transfer_call(call_id: str, target: str, provider_type: str, provider_config: Dict[str, Any],
                     transfer_type: str = "cold") -> Dict[str, Any]:
        """
        Universal call transfer function.
        
        Args:
            call_id: Call identifier
            target: Target phone number or extension
            provider_type: Provider type
            provider_config: Provider configuration
            transfer_type: 'cold' or 'warm'
            
        Returns:
            dict: {'success': bool, 'message': str, 'transfer_call_sid': str}
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            
            if transfer_type == "cold":
                return provider.cold_transfer(call_id, target)
            elif transfer_type == "warm":
                # For warm transfer, we need additional parameters
                logger.warning("Warm transfer requires additional parameters, use warm_transfer() method instead")
                return {
                    'success': False,
                    'message': 'Use warm_transfer() method for warm transfers',
                    'transfer_call_sid': None
                }
            else:
                return {
                    'success': False,
                    'message': f'Unknown transfer type: {transfer_type}',
                    'transfer_call_sid': None
                }
        except Exception as e:
            logger.error(f"Transfer failed: {str(e)}")
            return {
                'success': False,
                'message': f'Transfer error: {str(e)}',
                'transfer_call_sid': None
            }
    
    @staticmethod
    def warm_transfer(lead_call_sid: str, agent_phone: str, from_number: str,
                     provider_type: str, provider_config: Dict[str, Any],
                     introduction_message: str = "Transferring you to a specialist") -> Dict[str, Any]:
        """
        Perform warm transfer with introduction.
        
        Args:
            lead_call_sid: Lead's call SID
            agent_phone: Agent's phone number
            from_number: Caller ID to use
            provider_type: Provider type
            provider_config: Provider configuration
            introduction_message: Message AI will say
            
        Returns:
            dict: {'success': bool, 'conference_name': str, 'agent_call_sid': str, 'message': str}
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            
            return provider.warm_transfer_with_introduction(
                lead_call_sid,
                agent_phone,
                from_number,
                introduction_message
            )
        except Exception as e:
            logger.error(f"Warm transfer failed: {str(e)}")
            return {
                'success': False,
                'conference_name': None,
                'agent_call_sid': None,
                'message': f'Warm transfer error: {str(e)}'
            }
    
    # ===== CALL HOLD & RESUME =====
    
    @staticmethod
    def hold_call(call_id: str, provider_type: str, provider_config: Dict[str, Any],
                 hold_music_url: Optional[str] = None) -> bool:
        """
        Put call on hold with music.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            hold_music_url: Optional hold music URL
            
        Returns:
            bool: True if successful
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            return provider.hold_call(call_id, hold_music_url)
        except Exception as e:
            logger.error(f"Failed to hold call: {str(e)}")
            return False
    
    @staticmethod
    def resume_call(call_id: str, provider_type: str, provider_config: Dict[str, Any],
                   resume_webhook_url: str) -> bool:
        """
        Resume call from hold.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            resume_webhook_url: Webhook URL to resume call flow
            
        Returns:
            bool: True if successful
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            return provider.resume_call(call_id, resume_webhook_url)
        except Exception as e:
            logger.error(f"Failed to resume call: {str(e)}")
            return False
    
    # ===== CALL INFORMATION =====
    
    @staticmethod
    def get_call_status(call_id: str, provider_type: str, provider_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get call status and information.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            
        Returns:
            dict: Call information
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            return provider.get_call_status(call_id)
        except Exception as e:
            logger.error(f"Failed to get call status: {str(e)}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    @staticmethod
    def get_call_duration(call_id: str, provider_type: str, provider_config: Dict[str, Any]) -> int:
        """
        Get call duration in seconds.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            
        Returns:
            int: Duration in seconds
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            return provider.get_call_duration(call_id)
        except Exception as e:
            logger.error(f"Failed to get call duration: {str(e)}")
            return 0
    
    @staticmethod
    def get_call_recording_url(call_id: str, provider_type: str, provider_config: Dict[str, Any]) -> Optional[str]:
        """
        Get call recording URL.
        
        Args:
            call_id: Call identifier
            provider_type: Provider type
            provider_config: Provider configuration
            
        Returns:
            str: Recording URL or None
        """
        try:
            provider = CallControlService._get_provider(provider_type, provider_config)
            return provider.get_call_recording_url(call_id)
        except Exception as e:
            logger.error(f"Failed to get recording URL: {str(e)}")
            return None
    
    # ===== ERROR HANDLING & RETRY =====
    
    @staticmethod
    def handle_transfer_failure(transfer_id: str, reason: str) -> Dict[str, Any]:
        """
        Handle failed transfer with fallback mechanisms.
        
        Args:
            transfer_id: Transfer identifier
            reason: Failure reason
            
        Returns:
            dict: Fallback action details
        """
        logger.error(f"Transfer {transfer_id} failed: {reason}")
        
        # Fallback options:
        # 1. Try different agent
        # 2. Schedule callback instead
        # 3. Leave voicemail
        
        return {
            'fallback_action': 'schedule_callback',
            'reason': reason,
            'message': 'Transfer failed, scheduling callback instead'
        }
    
    @staticmethod
    def retry_transfer_with_different_agent(original_transfer_id: str, new_agent_phone: str,
                                           provider_type: str, provider_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retry transfer with a different agent.
        
        Args:
            original_transfer_id: Original transfer ID
            new_agent_phone: New agent's phone number
            provider_type: Provider type
            provider_config: Provider configuration
            
        Returns:
            dict: Transfer result
        """
        logger.info(f"Retrying transfer {original_transfer_id} with new agent {new_agent_phone}")
        
        # This would need the original call_sid
        # Implementation depends on how we track transfers
        
        return {
            'success': False,
            'message': 'Retry not implemented yet',
            'transfer_call_sid': None
        }


# Singleton instance
call_control_service = CallControlService()
