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

    def end_call_with_message(self, call_id: str, goodbye_message: str) -> bool:
        """
        End call after playing a goodbye message.
        
        Args:
            call_id: Twilio call SID
            goodbye_message: Message to play before hanging up
            
        Returns:
            bool: True if successful
        """
        try:
            # Use TwiML to say goodbye then hangup
            twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Say>{goodbye_message}</Say><Hangup/></Response>'
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
            
            payload = {
                'Twiml': twiml
            }
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error ending call with message: {str(e)}")
            return False

    def update_call_status(self, call_id: str, status: str) -> bool:
        """
        Update call status (completed, canceled).
        
        Args:
            call_id: Twilio call SID
            status: New status ('completed' or 'canceled')
            
        Returns:
            bool: True if successful
        """
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
        
        payload = {'Status': status}
        
        try:
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error updating call status: {str(e)}")
            return False

    # ===== CALL TRANSFER METHODS =====
    
    def cold_transfer(self, call_id: str, target_phone_number: str) -> Dict[str, Any]:
        """
        Perform cold transfer (direct transfer without introduction).
        
        Args:
            call_id: Twilio call SID to transfer
            target_phone_number: Phone number to transfer to (E.164 format)
            
        Returns:
            dict: {'success': bool, 'message': str, 'transfer_call_sid': str}
        """
        try:
            # Use TwiML to dial the target number
            twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Dial>
                    <Number>{target_phone_number}</Number>
                </Dial>
            </Response>'''
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
            
            payload = {'Twiml': twiml}
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'message': 'Cold transfer initiated',
                    'transfer_call_sid': call_id
                }
            else:
                return {
                    'success': False,
                    'message': f'Transfer failed: {response.text}',
                    'transfer_call_sid': None
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error during cold transfer: {str(e)}',
                'transfer_call_sid': None
            }

    def create_conference(self, conference_name: str, call_sid: str, start_on_enter: bool = True) -> Dict[str, Any]:
        """
        Create or join a conference room.
        
        Args:
            conference_name: Unique conference name
            call_sid: Call SID to add to conference
            start_on_enter: Whether conference starts when this participant enters
            
        Returns:
            dict: {'success': bool, 'conference_sid': str, 'message': str}
        """
        try:
            twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Dial>
                    <Conference startConferenceOnEnter="{'true' if start_on_enter else 'false'}" 
                                endConferenceOnExit="false">
                        {conference_name}
                    </Conference>
                </Dial>
            </Response>'''
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_sid}.json"
            
            payload = {'Twiml': twiml}
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'conference_sid': conference_name,
                    'message': 'Conference created/joined'
                }
            else:
                return {
                    'success': False,
                    'conference_sid': None,
                    'message': f'Failed to create conference: {response.text}'
                }
        except Exception as e:
            return {
                'success': False,
                'conference_sid': None,
                'message': f'Error creating conference: {str(e)}'
            }

    def add_participant_to_conference(self, conference_name: str, phone_number: str, from_number: str, 
                                     start_on_enter: bool = False) -> Dict[str, Any]:
        """
        Add a participant to an existing conference.
        
        Args:
            conference_name: Conference name
            phone_number: Phone number to add
            from_number: Caller ID to use
            start_on_enter: Whether conference starts when this participant enters
            
        Returns:
            dict: {'success': bool, 'participant_call_sid': str, 'message': str}
        """
        try:
            # Create TwiML URL for conference
            twiml_url = f"http://twimlets.com/conference?Name={conference_name}&StartConferenceOnEnter={'true' if start_on_enter else 'false'}"
            
            # Initiate call to the participant
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls.json"
            
            payload = {
                'From': from_number,
                'To': phone_number,
                'Url': twiml_url,
                'Method': 'GET'
            }
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            
            if response.status_code == 201:
                call_data = response.json()
                return {
                    'success': True,
                    'participant_call_sid': call_data['sid'],
                    'message': 'Participant added to conference'
                }
            else:
                return {
                    'success': False,
                    'participant_call_sid': None,
                    'message': f'Failed to add participant: {response.text}'
                }
        except Exception as e:
            return {
                'success': False,
                'participant_call_sid': None,
                'message': f'Error adding participant: {str(e)}'
            }

    def warm_transfer_with_introduction(self, lead_call_sid: str, agent_phone: str, from_number: str,
                                       introduction_message: str, conference_name: str = None) -> Dict[str, Any]:
        """
        Perform warm transfer with AI introduction.
        
        Flow:
        1. Put lead on hold
        2. Call agent and brief them
        3. Create conference with lead + agent
        4. AI introduces lead to agent
        5. AI leaves conference
        
        Args:
            lead_call_sid: Lead's call SID
            agent_phone: Agent's phone number
            from_number: Caller ID to use
            introduction_message: Message AI will say to introduce lead
            conference_name: Optional conference name (auto-generated if not provided)
            
        Returns:
            dict: {'success': bool, 'conference_name': str, 'agent_call_sid': str, 'message': str}
        """
        try:
            import time
            import uuid
            
            # Generate unique conference name
            if not conference_name:
                conference_name = f"transfer_{uuid.uuid4().hex[:8]}"
            
            # Step 1: Put lead in conference (on hold with music)
            lead_conference_result = self.create_conference(conference_name, lead_call_sid, start_on_enter=False)
            
            if not lead_conference_result['success']:
                return {
                    'success': False,
                    'conference_name': None,
                    'agent_call_sid': None,
                    'message': f"Failed to add lead to conference: {lead_conference_result['message']}"
                }
            
            # Step 2: Call agent and add to conference
            agent_result = self.add_participant_to_conference(
                conference_name, 
                agent_phone, 
                from_number,
                start_on_enter=True  # Conference starts when agent joins
            )
            
            if not agent_result['success']:
                return {
                    'success': False,
                    'conference_name': conference_name,
                    'agent_call_sid': None,
                    'message': f"Failed to add agent to conference: {agent_result['message']}"
                }
            
            # Note: In production, you would use conference events/webhooks to:
            # - Detect when agent joins
            # - Play introduction message
            # - Remove AI from conference
            
            return {
                'success': True,
                'conference_name': conference_name,
                'agent_call_sid': agent_result['participant_call_sid'],
                'message': 'Warm transfer initiated successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'conference_name': None,
                'agent_call_sid': None,
                'message': f'Error during warm transfer: {str(e)}'
            }

    def remove_participant_from_conference(self, conference_sid: str, call_sid: str) -> bool:
        """
        Remove a participant from conference (e.g., AI leaving after introduction).
        
        Args:
            conference_sid: Conference SID or name
            call_sid: Participant's call SID to remove
            
        Returns:
            bool: True if successful
        """
        try:
            # End the specific call to remove from conference
            return self.end_call(call_sid)
        except Exception as e:
            print(f"Error removing participant from conference: {str(e)}")
            return False

    # ===== CALL HOLD & RESUME =====
    
    def hold_call(self, call_id: str, hold_music_url: str = None) -> bool:
        """
        Put call on hold with music.
        
        Args:
            call_id: Twilio call SID
            hold_music_url: Optional URL to hold music (uses default if not provided)
            
        Returns:
            bool: True if successful
        """
        try:
            # Use default Twilio hold music if not provided
            if not hold_music_url:
                hold_music_url = "http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3"
            
            twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Play loop="0">{hold_music_url}</Play>
            </Response>'''
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
            
            payload = {'Twiml': twiml}
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error putting call on hold: {str(e)}")
            return False

    def resume_call(self, call_id: str, resume_webhook_url: str) -> bool:
        """
        Resume call from hold.
        
        Args:
            call_id: Twilio call SID
            resume_webhook_url: Webhook URL to resume call flow
            
        Returns:
            bool: True if successful
        """
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
            
            payload = {
                'Url': resume_webhook_url,
                'Method': 'POST'
            }
            
            response = requests.post(
                url,
                auth=(self.config['account_sid'], self.config['auth_token']),
                data=payload
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error resuming call: {str(e)}")
            return False

    # ===== CALL INFORMATION =====
    
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get current call status and information.
        
        Args:
            call_id: Twilio call SID
            
        Returns:
            dict: Call information including status, duration, etc.
        """
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}.json"
            
            response = requests.get(
                url,
                auth=(self.config['account_sid'], self.config['auth_token'])
            )
            
            if response.status_code == 200:
                call_data = response.json()
                return {
                    'success': True,
                    'status': call_data.get('status'),
                    'duration': call_data.get('duration'),
                    'from': call_data.get('from'),
                    'to': call_data.get('to'),
                    'direction': call_data.get('direction'),
                    'start_time': call_data.get('start_time'),
                    'end_time': call_data.get('end_time')
                }
            else:
                return {
                    'success': False,
                    'message': f'Failed to get call status: {response.text}'
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error getting call status: {str(e)}'
            }

    def get_call_duration(self, call_id: str) -> int:
        """
        Get call duration in seconds.
        
        Args:
            call_id: Twilio call SID
            
        Returns:
            int: Duration in seconds (0 if call not found or still in progress)
        """
        call_info = self.get_call_status(call_id)
        if call_info.get('success'):
            return int(call_info.get('duration', 0) or 0)
        return 0

    def get_call_recording_url(self, call_id: str) -> str:
        """
        Get call recording URL if available.
        
        Args:
            call_id: Twilio call SID
            
        Returns:
            str: Recording URL or None
        """
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Calls/{call_id}/Recordings.json"
            
            response = requests.get(
                url,
                auth=(self.config['account_sid'], self.config['auth_token'])
            )
            
            if response.status_code == 200:
                recordings = response.json().get('recordings', [])
                if recordings:
                    recording_sid = recordings[0]['sid']
                    return f"https://api.twilio.com/2010-04-01/Accounts/{self.config['account_sid']}/Recordings/{recording_sid}"
            return None
        except Exception as e:
            print(f"Error getting recording URL: {str(e)}")
            return None

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

