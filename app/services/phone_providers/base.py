from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePhoneProvider(ABC):
    """
    Abstract base class that defines the standard interface 
    for all phone providers.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config

    @abstractmethod
    def validate_credentials(self) -> bool:
        """Test if the provided credentials work."""
        pass

    @abstractmethod
    def initiate_call(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """
        Start an outbound call.
        Returns: unique_call_id (provider specific)
        """
        pass

    @abstractmethod
    def end_call(self, call_id: str) -> bool:
        """Hang up an active call."""
        pass

    # ===== CALL TRANSFER METHODS =====
    
    @abstractmethod
    def cold_transfer(self, call_id: str, target_phone_number: str) -> Dict[str, Any]:
        """
        Perform cold transfer (direct transfer without introduction).
        Returns: {'success': bool, 'message': str, 'transfer_call_sid': str}
        """
        pass

    @abstractmethod
    def warm_transfer_with_introduction(self, lead_call_sid: str, agent_phone: str, 
                                       from_number: str, introduction_message: str, 
                                       conference_name: str = None) -> Dict[str, Any]:
        """
        Perform warm transfer with AI introduction.
        Returns: {'success': bool, 'conference_name': str, 'agent_call_sid': str, 'message': str}
        """
        pass

    # ===== CALL HOLD & RESUME =====
    
    @abstractmethod
    def hold_call(self, call_id: str, hold_music_url: str = None) -> bool:
        """Put call on hold with music."""
        pass

    @abstractmethod
    def resume_call(self, call_id: str, resume_webhook_url: str) -> bool:
        """Resume call from hold."""
        pass

    # ===== CALL INFORMATION =====
    
    @abstractmethod
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get current call status and information.
        Returns: dict with status, duration, from, to, etc.
        """
        pass

    @abstractmethod
    def get_call_duration(self, call_id: str) -> int:
        """Get call duration in seconds."""
        pass

    @abstractmethod
    def get_call_recording_url(self, call_id: str) -> str:
        """Get call recording URL if available."""
        pass

    @abstractmethod
    def normalize_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert provider-specific webhook data into our standard format.
        Standard format:
        {
            'external_id': str,
            'status': str ('queued', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'),
            'duration': int (seconds),
            'recording_url': Optional[str],
            'cost': float
        }
        """
        pass

    @abstractmethod
    def configure_phone_number_webhook(self, phone_number: str, webhook_url: str, status_callback_url: str) -> bool:
        """
        Configure webhook URLs for an imported phone number.
        
        Args:
            phone_number: The phone number to configure (E.164 format, e.g., +16692313371)
            webhook_url: The webhook URL for incoming calls
            status_callback_url: The URL for call status callbacks
            
        Returns:
            bool: True if successful, False otherwise
        """
        pass

    @abstractmethod
    def list_phone_numbers(self) -> list:
        """
        Fetch all active phone numbers from the provider account.
        
        Returns:
            List of dictionaries with phone number details:
            [
                {
                    'sid': str,
                    'phone_number': str (E.164 format),
                    'friendly_name': str,
                    'capabilities': dict
                }
            ]
        """
        pass
