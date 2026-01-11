"""
Twilio SIP Provider Implementation

Implements the BaseSIPProvider interface using Twilio's Voice API and SIP Domains.
"""

import os
import socket
from typing import Dict, Any, Optional
from datetime import datetime
from twilio.rest import Client
from twilio.request_validator import RequestValidator
from .base import BaseSIPProvider


class TwilioSIPProvider(BaseSIPProvider):
    """Twilio implementation of SIP provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        
        # Initialize Twilio client
        self.client = Client(
            config['account_sid'],
            config['auth_token']
        )
        
        # Initialize request validator for webhook security
        self.validator = RequestValidator(config['auth_token'])
        
        self.account_sid = config['account_sid']
        self.sip_domain = config.get('sip_domain', 'speaksynthai.sip.twilio.com')
        self.sip_domain_sid = config.get('sip_domain_sid')
        self.backend_url = config.get('backend_url', '')
        self.websocket_url = config.get('websocket_url', '')
    
    def configure_domain(self, domain_name: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Configure Twilio SIP domain
        
        Note: For now, domain must be created manually in Twilio Console.
        This method validates the configuration.
        
        Future: Implement automatic domain creation via API
        """
        try:
            # Fetch domain details to validate it exists
            if self.sip_domain_sid:
                domain = self.client.sip.domains(self.sip_domain_sid).fetch()
                
                return {
                    'domain_sid': domain.sid,
                    'domain_name': domain.domain_name,
                    'full_domain': f"{domain.domain_name}",
                    'voice_url': domain.voice_url,
                    'configured': True
                }
            else:
                # Domain SID not provided, return expected configuration
                return {
                    'domain_sid': None,
                    'domain_name': domain_name,
                    'full_domain': f"{domain_name}.sip.twilio.com",
                    'voice_url': f"{self.backend_url}/api/sip/webhook/voice",
                    'configured': False,
                    'message': 'Domain must be created manually in Twilio Console'
                }
        
        except Exception as e:
            raise Exception(f"Failed to configure Twilio SIP domain: {str(e)}")
    
    def handle_inbound_call(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming call from Twilio
        
        Twilio sends data in this format:
        {
            'CallSid': 'CA...',
            'From': 'sip:user@pbx.com',
            'To': 'sip:+15551234567@domain.com',
            'CallStatus': 'ringing',
            ...
        }
        """
        # Extract phone number from 'To' field
        to_uri = request_data.get('To', '')
        phone_number = self.extract_phone_number(to_uri)
        
        return {
            'call_id': request_data.get('CallSid'),
            'from': request_data.get('From', ''),
            'to': to_uri,
            'phone_number': phone_number,
            'direction': 'inbound',
            'status': request_data.get('CallStatus', 'unknown'),
            'account_sid': request_data.get('AccountSid'),
            'provider': 'twilio'
        }
    
    def initiate_outbound_call(
        self,
        from_number: str,
        to_sip_address: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Initiate outbound call through Twilio to user's PBX
        
        Args:
            from_number: Caller ID (E.164)
            to_sip_address: Full SIP URI (e.g., 'sip:+1999@pbx.com')
            settings: {
                'auth_username': str (optional),
                'auth_password': str (optional),
                'twiml_url': str,
                'status_callback_url': str (optional)
            }
        """
        try:
            # Prepare call parameters
            call_params = {
                'to': to_sip_address,
                'from_': from_number,
                'url': settings.get('twiml_url'),
            }
            
            # Add SIP authentication if provided
            if settings.get('auth_username'):
                call_params['sip_auth_username'] = settings['auth_username']
            if settings.get('auth_password'):
                call_params['sip_auth_password'] = settings['auth_password']
            
            # Add status callback if provided
            if settings.get('status_callback_url'):
                call_params['status_callback'] = settings['status_callback_url']
                call_params['status_callback_event'] = [
                    'initiated', 'ringing', 'answered', 'completed'
                ]
            
            # Make the call
            call = self.client.calls.create(**call_params)
            
            return {
                'call_id': call.sid,
                'status': call.status,
                'provider_call_id': call.sid,
                'direction': 'outbound',
                'to': to_sip_address,
                'from': from_number,
                'provider': 'twilio'
            }
        
        except Exception as e:
            raise Exception(f"Failed to initiate outbound call: {str(e)}")
    
    def generate_call_instructions(
        self,
        agent_id: str,
        call_data: Dict[str, Any],
        websocket_url: str
    ) -> str:
        """
        Generate TwiML for connecting call to agent via WebSocket
        
        Returns TwiML XML string
        """
        call_sid = call_data.get('call_id', '')
        phone_number = call_data.get('phone_number', '')
        direction = call_data.get('direction', 'inbound')
        
        twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Connecting you to our AI agent</Say>
    <Connect>
        <Stream url="{websocket_url}">
            <Parameter name="agent_id" value="{agent_id}"/>
            <Parameter name="call_sid" value="{call_sid}"/>
            <Parameter name="phone_number" value="{phone_number}"/>
            <Parameter name="direction" value="{direction}"/>
        </Stream>
    </Connect>
</Response>'''
        
        return twiml
    
    def generate_error_instructions(self, error_message: str) -> str:
        """
        Generate TwiML for error handling
        """
        # Sanitize error message for speech
        safe_message = error_message.replace('<', '').replace('>', '').replace('&', 'and')
        
        twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, {safe_message}. Please contact support.</Say>
    <Pause length="1"/>
    <Hangup/>
</Response>'''
        
        return twiml
    
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get call status from Twilio
        """
        try:
            call = self.client.calls(call_id).fetch()
            
            result = {
                'call_id': call.sid,
                'status': call.status,
                'direction': call.direction,
                'from': call.from_,
                'to': call.to,
                'duration': call.duration if call.duration else 0,
                'provider': 'twilio'
            }
            
            if call.start_time:
                result['start_time'] = call.start_time
            if call.end_time:
                result['end_time'] = call.end_time
            
            return result
        
        except Exception as e:
            raise Exception(f"Failed to get call status: {str(e)}")
    
    def validate_webhook(self, request_data: Dict[str, Any], signature: str) -> bool:
        """
        Validate Twilio webhook signature
        
        Args:
            request_data: POST parameters from webhook
            signature: X-Twilio-Signature header value
        """
        try:
            url = request_data.get('_webhook_url', '')
            params = {k: v for k, v in request_data.items() if not k.startswith('_')}
            
            return self.validator.validate(url, params, signature)
        except Exception:
            return False
    
    def send_sip_options(self, sip_address: str, timeout: int = 5) -> Dict[str, Any]:
        """
        Check PBX health using TCP socket connection
        
        Note: This is a basic TCP check. For production, should use actual SIP OPTIONS.
        Future: Implement real SIP OPTIONS using pjsua2 or sippy library.
        """
        try:
            # Parse SIP address
            # Format: pbx.company.com or pbx.company.com:5060
            host = sip_address
            port = 5060  # Default SIP port
            
            # Remove sip: prefix if present
            if host.startswith('sip:'):
                host = host[4:]
            
            # Extract port if specified
            if ':' in host:
                host, port_str = host.split(':')
                port = int(port_str)
            
            # Try TCP connection
            start_time = datetime.now()
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            
            result = sock.connect_ex((host, port))
            sock.close()
            
            end_time = datetime.now()
            latency_ms = int((end_time - start_time).total_seconds() * 1000)
            
            if result == 0:
                return {
                    'success': True,
                    'latency_ms': latency_ms,
                    'method': 'tcp_check',
                    'host': host,
                    'port': port
                }
            else:
                return {
                    'success': False,
                    'error': f'Connection failed to {host}:{port}',
                    'method': 'tcp_check',
                    'host': host,
                    'port': port
                }
        
        except socket.gaierror:
            return {
                'success': False,
                'error': f'DNS resolution failed for {sip_address}',
                'method': 'tcp_check'
            }
        except socket.timeout:
            return {
                'success': False,
                'error': f'Connection timeout after {timeout} seconds',
                'method': 'tcp_check'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'method': 'tcp_check'
            }
