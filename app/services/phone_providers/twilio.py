import requests
from typing import Dict, Any
from .base import BasePhoneProvider
import base64

class TwilioProvider(BasePhoneProvider):
    def validate_credentials(self) -> bool:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}.json"
        try:
            response = requests.get(
                url, 
                auth=(self.config['account_sid'], self.config['auth_token'])
            )
            return response.status_code == 200
        except:
            return False

    def initiate_call(self, to_number: str, from_number: str, webhook_url: str) -> str:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls.json"
        
        payload = {
            'From': from_number,
            'To': to_number,
            'Url': webhook_url,
            'StatusCallback': webhook_url,
            'StatusCallbackEvent': ['initiated', 'ringing', 'answered', 'completed'],
            'StatusCallbackMethod': 'POST'
        }
        
        response = requests.post(
            url, 
            auth=(self.config['account_sid'], self.config['auth_token']), 
            data=payload
        )
        response.raise_for_status()
        
        return response.json()['sid']

    def end_call(self, call_id: str) -> bool:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
        
        payload = {'Status': 'completed'}
        
        try:
            response = requests.post(
                url, 
                auth=(self.config['account_sid'], self.config['auth_token']), 
                data=payload
            )
            return response.status_code == 200
        except:
            return False

    def normalize_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Twilio webhook format mapping
        status_map = {
            'queued': 'queued',
            'ringing': 'ringing',
            'in-progress': 'in-progress',
            'completed': 'completed',
            'busy': 'busy',
            'failed': 'failed',
            'no-answer': 'no_answer',
            'canceled': 'canceled'
        }
        
        return {
            'external_id': payload.get('CallSid'),
            'status': status_map.get(payload.get('CallStatus'), 'unknown'),
            'duration': int(payload.get('CallDuration', 0)),
            'recording_url': payload.get('RecordingUrl'),
            'cost': 0.0 # Twilio usually sends cost in a separate field or request
        }

    def configure_phone_number_webhook(self, phone_number: str, webhook_url: str, status_callback_url: str) -> bool:
        """
        Configure webhook URLs for an imported Twilio phone number.
        
        Args:
            phone_number: The phone number to configure (E.164 format, e.g., +16692313371)
            webhook_url: The webhook URL for incoming calls
            status_callback_url: The URL for call status callbacks
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # First, get the phone number SID
            # List all phone numbers and find the matching one
            list_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/IncomingPhoneNumbers.json"
            
            response = requests.get(
                list_url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                params={'PhoneNumber': phone_number}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch phone number: {response.status_code} - {response.text}")
                return False
            
            phone_numbers = response.json().get('incoming_phone_numbers', [])
            if not phone_numbers:
                print(f"Phone number {phone_number} not found in Twilio account")
                return False
            
            phone_number_sid = phone_numbers[0]['sid']
            
            # Update the phone number with webhook configuration
            update_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/IncomingPhoneNumbers/{phone_number_sid}.json"
            
            payload = {
                'VoiceUrl': webhook_url,
                'VoiceMethod': 'POST',
                'StatusCallback': status_callback_url,
                'StatusCallbackMethod': 'POST'
            }
            
            update_response = requests.post(
                update_url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            
            if update_response.status_code == 200:
                print(f"Successfully configured webhook for {phone_number}")
                return True
            else:
                print(f"Failed to configure webhook: {update_response.status_code} - {update_response.text}")
                return False
                
        except Exception as e:
            print(f"Error configuring webhook for {phone_number}: {str(e)}")
            return False
    
    def list_phone_numbers(self) -> list:
        """
        Fetch all active phone numbers from Twilio account.
        
        Returns:
            List of phone number dictionaries with sid, phone_number, friendly_name, capabilities
        """
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/IncomingPhoneNumbers.json"
            
            response = requests.get(
                url,
                auth=(self.config['account_sid'], self.config['auth_token'])
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch phone numbers: {response.status_code}")
                return []
            
            phone_numbers = response.json().get('incoming_phone_numbers', [])
            
            # Transform to standard format
            result = []
            for pn in phone_numbers:
                result.append({
                    'sid': pn.get('sid'),
                    'phone_number': pn.get('phone_number'),
                    'friendly_name': pn.get('friendly_name', pn.get('phone_number')),
                    'capabilities': {
                        'voice': pn.get('capabilities', {}).get('voice', False),
                        'sms': pn.get('capabilities', {}).get('sms', False),
                        'mms': pn.get('capabilities', {}).get('mms', False)
                    }
                })
            
            return result
            
        except Exception as e:
            print(f"Error fetching phone numbers: {str(e)}")
            return []

