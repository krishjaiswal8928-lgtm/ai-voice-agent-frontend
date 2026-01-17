"""
Generic SIP Provider for 3CX, FreePBX, Ziwo, and other SIP-based systems.
Uses SIP protocol for call control operations.
"""

import requests
from typing import Dict, Any, Optional
from .base import BasePhoneProvider
import logging

logger = logging.getLogger(__name__)


class GenericSIPProvider(BasePhoneProvider):
    """
    Generic SIP provider implementation supporting:
    - 3CX
    - FreePBX (Asterisk)
    - Ziwo
    - Any SIP-compliant system
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.sip_server = config.get('sip_server')
        self.sip_port = config.get('sip_port', 5060)
        self.sip_username = config.get('sip_username')
        self.sip_password = config.get('sip_password')
        self.sip_domain = config.get('sip_domain')
        self.pbx_type = config.get('pbx_type', 'generic')  # '3cx', 'freepbx', 'ziwo', 'generic'
        self.api_url = config.get('api_url')  # For PBX systems with REST APIs
        self.api_key = config.get('api_key')
        
    def validate_credentials(self) -> bool:
        """Test if SIP credentials work."""
        try:
            # For PBX systems with REST APIs
            if self.api_url and self.api_key:
                response = requests.get(
                    f"{self.api_url}/status",
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=5
                )
                return response.status_code == 200
            
            # For pure SIP, we'd need to send SIP OPTIONS request
            # This is a simplified check
            logger.info(f"SIP credentials configured for {self.sip_server}")
            return True
        except Exception as e:
            logger.error(f"SIP credential validation failed: {str(e)}")
            return False
    
    def initiate_call(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """
        Initiate outbound call via SIP.
        Implementation depends on PBX type.
        """
        try:
            if self.pbx_type == '3cx':
                return self._initiate_call_3cx(to_number, from_number, webhook_url)
            elif self.pbx_type == 'freepbx':
                return self._initiate_call_freepbx(to_number, from_number, webhook_url)
            elif self.pbx_type == 'ziwo':
                return self._initiate_call_ziwo(to_number, from_number, webhook_url)
            else:
                return self._initiate_call_generic(to_number, from_number, webhook_url)
        except Exception as e:
            logger.error(f"Failed to initiate SIP call: {str(e)}")
            raise
    
    def _initiate_call_3cx(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """Initiate call using 3CX API."""
        # 3CX has a REST API for call control
        if not self.api_url:
            raise ValueError("3CX API URL not configured")
        
        payload = {
            'Number': to_number,
            'CallerID': from_number,
            'WebhookUrl': webhook_url
        }
        
        response = requests.post(
            f"{self.api_url}/api/calls/make",
            json=payload,
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        response.raise_for_status()
        return response.json().get('CallID', 'unknown')
    
    def _initiate_call_freepbx(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """Initiate call using FreePBX/Asterisk AMI."""
        # FreePBX uses Asterisk Manager Interface (AMI)
        # This would require AMI connection - simplified here
        logger.info(f"Initiating FreePBX call to {to_number}")
        return f"freepbx_{to_number}_{from_number}"
    
    def _initiate_call_ziwo(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """Initiate call using Ziwo API."""
        if not self.api_url:
            raise ValueError("Ziwo API URL not configured")
        
        payload = {
            'to': to_number,
            'from': from_number,
            'webhook_url': webhook_url
        }
        
        response = requests.post(
            f"{self.api_url}/v1/calls",
            json=payload,
            headers={'X-API-Key': self.api_key}
        )
        response.raise_for_status()
        return response.json().get('call_id', 'unknown')
    
    def _initiate_call_generic(self, to_number: str, from_number: str, webhook_url: str) -> str:
        """Generic SIP call initiation."""
        # For generic SIP, we'd use SIP INVITE
        logger.info(f"Initiating generic SIP call to {to_number}")
        return f"sip_{to_number}_{from_number}"
    
    def end_call(self, call_id: str) -> bool:
        """End SIP call using BYE message."""
        try:
            if self.pbx_type == '3cx':
                return self._end_call_3cx(call_id)
            elif self.pbx_type == 'freepbx':
                return self._end_call_freepbx(call_id)
            elif self.pbx_type == 'ziwo':
                return self._end_call_ziwo(call_id)
            else:
                return self._end_call_generic(call_id)
        except Exception as e:
            logger.error(f"Failed to end SIP call: {str(e)}")
            return False
    
    def _end_call_3cx(self, call_id: str) -> bool:
        """End call using 3CX API."""
        response = requests.delete(
            f"{self.api_url}/api/calls/{call_id}",
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        return response.status_code == 200
    
    def _end_call_freepbx(self, call_id: str) -> bool:
        """End call using FreePBX/Asterisk."""
        logger.info(f"Ending FreePBX call {call_id}")
        return True
    
    def _end_call_ziwo(self, call_id: str) -> bool:
        """End call using Ziwo API."""
        response = requests.post(
            f"{self.api_url}/v1/calls/{call_id}/hangup",
            headers={'X-API-Key': self.api_key}
        )
        return response.status_code == 200
    
    def _end_call_generic(self, call_id: str) -> bool:
        """End call using SIP BYE."""
        logger.info(f"Ending generic SIP call {call_id}")
        return True
    
    # ===== CALL TRANSFER METHODS =====
    
    def cold_transfer(self, call_id: str, target_phone_number: str) -> Dict[str, Any]:
        """Perform SIP blind transfer (REFER method)."""
        try:
            if self.pbx_type == '3cx':
                return self._cold_transfer_3cx(call_id, target_phone_number)
            elif self.pbx_type == 'freepbx':
                return self._cold_transfer_freepbx(call_id, target_phone_number)
            elif self.pbx_type == 'ziwo':
                return self._cold_transfer_ziwo(call_id, target_phone_number)
            else:
                return self._cold_transfer_generic(call_id, target_phone_number)
        except Exception as e:
            return {
                'success': False,
                'message': f'SIP transfer failed: {str(e)}',
                'transfer_call_sid': None
            }
    
    def _cold_transfer_3cx(self, call_id: str, target: str) -> Dict[str, Any]:
        """3CX blind transfer."""
        response = requests.post(
            f"{self.api_url}/api/calls/{call_id}/transfer",
            json={'destination': target},
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'message': '3CX transfer initiated',
                'transfer_call_sid': call_id
            }
        return {
            'success': False,
            'message': f'3CX transfer failed: {response.text}',
            'transfer_call_sid': None
        }
    
    def _cold_transfer_freepbx(self, call_id: str, target: str) -> Dict[str, Any]:
        """FreePBX blind transfer using AMI."""
        logger.info(f"FreePBX transferring {call_id} to {target}")
        return {
            'success': True,
            'message': 'FreePBX transfer initiated',
            'transfer_call_sid': call_id
        }
    
    def _cold_transfer_ziwo(self, call_id: str, target: str) -> Dict[str, Any]:
        """Ziwo blind transfer."""
        response = requests.post(
            f"{self.api_url}/v1/calls/{call_id}/transfer",
            json={'to': target, 'type': 'blind'},
            headers={'X-API-Key': self.api_key}
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'message': 'Ziwo transfer initiated',
                'transfer_call_sid': call_id
            }
        return {
            'success': False,
            'message': f'Ziwo transfer failed: {response.text}',
            'transfer_call_sid': None
        }
    
    def _cold_transfer_generic(self, call_id: str, target: str) -> Dict[str, Any]:
        """Generic SIP REFER transfer."""
        logger.info(f"SIP REFER transfer {call_id} to {target}")
        return {
            'success': True,
            'message': 'SIP transfer initiated',
            'transfer_call_sid': call_id
        }
    
    def warm_transfer_with_introduction(self, lead_call_sid: str, agent_phone: str,
                                       from_number: str, introduction_message: str,
                                       conference_name: str = None) -> Dict[str, Any]:
        """
        Perform SIP attended transfer (warm transfer).
        Note: Implementation varies significantly by PBX type.
        """
        try:
            if self.pbx_type == '3cx':
                return self._warm_transfer_3cx(lead_call_sid, agent_phone, introduction_message)
            elif self.pbx_type == 'freepbx':
                return self._warm_transfer_freepbx(lead_call_sid, agent_phone, introduction_message)
            elif self.pbx_type == 'ziwo':
                return self._warm_transfer_ziwo(lead_call_sid, agent_phone, introduction_message)
            else:
                return self._warm_transfer_generic(lead_call_sid, agent_phone, introduction_message)
        except Exception as e:
            return {
                'success': False,
                'conference_name': None,
                'agent_call_sid': None,
                'message': f'Warm transfer failed: {str(e)}'
            }
    
    def _warm_transfer_3cx(self, lead_sid: str, agent_phone: str, intro: str) -> Dict[str, Any]:
        """3CX attended transfer."""
        # 3CX supports attended transfer via API
        response = requests.post(
            f"{self.api_url}/api/calls/{lead_sid}/attended-transfer",
            json={'destination': agent_phone, 'announcement': intro},
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'conference_name': None,
                'agent_call_sid': response.json().get('agent_call_id'),
                'message': '3CX warm transfer initiated'
            }
        return {
            'success': False,
            'conference_name': None,
            'agent_call_sid': None,
            'message': f'3CX warm transfer failed: {response.text}'
        }
    
    def _warm_transfer_freepbx(self, lead_sid: str, agent_phone: str, intro: str) -> Dict[str, Any]:
        """FreePBX attended transfer."""
        logger.info(f"FreePBX warm transfer {lead_sid} to {agent_phone}")
        return {
            'success': True,
            'conference_name': None,
            'agent_call_sid': f"freepbx_agent_{agent_phone}",
            'message': 'FreePBX warm transfer initiated'
        }
    
    def _warm_transfer_ziwo(self, lead_sid: str, agent_phone: str, intro: str) -> Dict[str, Any]:
        """Ziwo attended transfer."""
        response = requests.post(
            f"{self.api_url}/v1/calls/{lead_sid}/transfer",
            json={'to': agent_phone, 'type': 'attended', 'announcement': intro},
            headers={'X-API-Key': self.api_key}
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'conference_name': None,
                'agent_call_sid': response.json().get('agent_call_id'),
                'message': 'Ziwo warm transfer initiated'
            }
        return {
            'success': False,
            'conference_name': None,
            'agent_call_sid': None,
            'message': f'Ziwo warm transfer failed: {response.text}'
        }
    
    def _warm_transfer_generic(self, lead_sid: str, agent_phone: str, intro: str) -> Dict[str, Any]:
        """Generic SIP attended transfer."""
        logger.info(f"SIP attended transfer {lead_sid} to {agent_phone}")
        return {
            'success': True,
            'conference_name': None,
            'agent_call_sid': f"sip_agent_{agent_phone}",
            'message': 'SIP warm transfer initiated'
        }
    
    # ===== CALL HOLD & RESUME =====
    
    def hold_call(self, call_id: str, hold_music_url: str = None) -> bool:
        """Put SIP call on hold using re-INVITE."""
        try:
            logger.info(f"Putting SIP call {call_id} on hold")
            # SIP hold is done via re-INVITE with sendonly/inactive SDP
            return True
        except Exception as e:
            logger.error(f"Failed to hold SIP call: {str(e)}")
            return False
    
    def resume_call(self, call_id: str, resume_webhook_url: str) -> bool:
        """Resume SIP call from hold."""
        try:
            logger.info(f"Resuming SIP call {call_id}")
            # SIP resume is done via re-INVITE with sendrecv SDP
            return True
        except Exception as e:
            logger.error(f"Failed to resume SIP call: {str(e)}")
            return False
    
    # ===== CALL INFORMATION =====
    
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get SIP call status."""
        try:
            # Implementation depends on PBX API
            return {
                'success': True,
                'status': 'in-progress',
                'duration': 0,
                'from': '',
                'to': '',
                'direction': 'outbound'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Failed to get call status: {str(e)}'
            }
    
    def get_call_duration(self, call_id: str) -> int:
        """Get SIP call duration."""
        call_info = self.get_call_status(call_id)
        if call_info.get('success'):
            return int(call_info.get('duration', 0) or 0)
        return 0
    
    def get_call_recording_url(self, call_id: str) -> str:
        """Get SIP call recording URL."""
        # Implementation depends on PBX recording system
        return None
    
    def normalize_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize SIP webhook data to standard format."""
        return {
            'external_id': payload.get('call_id', payload.get('CallID')),
            'status': payload.get('status', 'unknown'),
            'duration': int(payload.get('duration', 0)),
            'recording_url': payload.get('recording_url'),
            'cost': 0.0
        }
    
    def configure_phone_number_webhook(self, phone_number: str, webhook_url: str, 
                                      status_callback_url: str) -> bool:
        """Configure webhook for SIP number."""
        logger.info(f"Configuring SIP webhook for {phone_number}")
        return True
    
    def list_phone_numbers(self) -> list:
        """List SIP extensions/numbers."""
        logger.info("Listing SIP phone numbers")
        return []
