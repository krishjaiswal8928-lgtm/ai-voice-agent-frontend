import requests
from typing import Dict, Any
from .base import BasePhoneProvider

class ExotelProvider(BasePhoneProvider):
    def validate_credentials(self) -> bool:
        # Simple check by fetching account details or making a dummy request
        url = f"https://api.exotel.com/v1/Accounts/{self.config['account_sid']}"
        try:
            response = requests.get(
                url, 
                auth=(self.config['api_key'], self.config['api_token'])
            )
            return response.status_code == 200
        except:
            return False

    def initiate_call(self, to_number: str, from_number: str, webhook_url: str) -> str:
        url = f"https://api.exotel.com/v1/Accounts/{self.config['account_sid']}/Calls/connect"
        
        payload = {
            'From': from_number,
            'To': to_number,
            'CallerId': self.config.get('caller_id', from_number),
            'Url': webhook_url,
            'StatusCallback': webhook_url,
            'StatusCallbackContentType': 'application/json',
            'StatusCallbackEvent': 'terminal' # Get callback only when call ends
        }
        
        response = requests.post(
            url, 
            auth=(self.config['api_key'], self.config['api_token']), 
            data=payload
        )
        response.raise_for_status()
        
        return response.json()['Call']['Sid']

    def end_call(self, call_id: str) -> bool:
        # Exotel doesn't have a direct "end call" API for simple calls easily accessible without more context,
        # but usually we don't need to end calls manually from this side for basic flows.
        # Implementing a placeholder or specific endpoint if available.
        return True

    def normalize_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Exotel webhook format mapping
        status_map = {
            'completed': 'completed',
            'busy': 'busy',
            'no-answer': 'no_answer',
            'failed': 'failed',
            'canceled': 'canceled',
            'in-progress': 'in-progress',
            'ringing': 'ringing'
        }
        
        return {
            'external_id': payload.get('CallSid'),
            'status': status_map.get(payload.get('Status'), 'unknown'),
            'duration': int(payload.get('Duration', 0)),
            'recording_url': payload.get('RecordingUrl'),
            'cost': float(payload.get('Price', 0) or 0)
        }
