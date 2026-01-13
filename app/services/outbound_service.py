from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from typing import Optional, Dict
import logging
import os
from dotenv import load_dotenv
import urllib.parse
import re

load_dotenv()

logger = logging.getLogger(__name__)

class OutboundCallService:
    def __init__(self):
        self.client = None
        self.from_number = None
        self.webhook_base = None
        
    def initialize(self, account_sid: str, auth_token: str, from_number: str, webhook_base: str):
        try:
            self.client = Client(account_sid, auth_token)
            self.from_number = from_number
            # Ensure webhook_base is just the protocol + domain
            if webhook_base:
                # Remove trailing slashes
                webhook_base = webhook_base.rstrip('/')
                # Check if it accidentally includes the path already (common config error)
                if '/twilio/voice/webhook' in webhook_base:
                    webhook_base = webhook_base.split('/twilio/voice/webhook')[0]
                elif '/twilio/status' in webhook_base:
                     webhook_base = webhook_base.split('/twilio/status')[0]
            
            self.webhook_base = webhook_base
            logger.info(f"✅ Twilio client initialized with base: {self.webhook_base}")
        except Exception as e:
            logger.error(f"❌ Twilio client init error: {e}")
            self.client = None

    async def make_call(self, to_number: str, call_context: Optional[Dict] = None, greeting: Optional[str] = None, from_number: Optional[str] = None, credentials: Optional[Dict] = None) -> Dict:
        
        # Determine client and from_number to use
        active_client = self.client
        active_webhook_base = self.webhook_base
        
        # Override with specific credentials if provided
        if credentials and credentials.get('account_sid') and credentials.get('auth_token'):
            try:
                active_client = Client(credentials['account_sid'], credentials['auth_token'])
                # Need to determine webhook base for this new client? 
                # For now, reuse global webhook base or env var
                if not active_webhook_base:
                     active_webhook_base = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
                     if active_webhook_base and not active_webhook_base.startswith('http'):
                         active_webhook_base = f"https://{active_webhook_base}"
            except Exception as e:
                return {"success": False, "error": f"Invalid custom credentials: {e}"}

        if not active_client:
            return {"success": False, "error": "Twilio client not initialized"}

        # Use provided from_number or fallback to configured default
        active_from_number = from_number or self.from_number
        if not active_from_number:
            return {"success": False, "error": "Twilio phone number not configured"}

        if not to_number:
            return {"success": False, "error": "Phone number required"}

        # Handle Indian phone numbers
        if not to_number.startswith("+"):
            # Check if it's a 10-digit Indian number
            cleaned_number = re.sub(r'\D', '', to_number)
            if len(cleaned_number) == 10 and cleaned_number[0] in '6789':
                # Likely an Indian mobile number, add +91 country code
                to_number = f"+91{cleaned_number}"
            elif len(cleaned_number) == 11 and cleaned_number.startswith('0'):
                # Indian number with leading 0, remove 0 and add +91
                to_number = f"+91{cleaned_number[1:]}"
            else:
                # Assume US/Canada number, add +1
                to_number = f"+1{cleaned_number}"

        try:
            logger.info(f"📞 Initiating call → {to_number}")

            # Check for TwiML Bin URL in environment or config
            twiml_bin_url = os.getenv("TWIML_BIN_URL")
            
            if twiml_bin_url:
                # Use TwiML Bin
                logger.info(f"Using TwiML Bin: {twiml_bin_url}")
                webhook_url = twiml_bin_url
                
                # Append parameters for the TwiML Bin to read (campaign_id, etc.)
                if call_context:
                    # TwiML Bins read params from query string via {{value}} syntax
                    encoded_params = []
                    for k, v in call_context.items():
                        if v: # Only append if value exists
                            key = urllib.parse.quote_plus(str(k))
                            value = urllib.parse.quote_plus(str(v))
                            encoded_params.append(f"{key}={value}")
                    
                    if encoded_params:
                        separator = "&" if "?" in webhook_url else "?"
                        webhook_url = f"{webhook_url}{separator}{'&'.join(encoded_params)}"
                
                logger.info(f"Final TwiML Bin URL: {webhook_url}")
                
                # No status_callback for TwiML Bin calls unless we explicitly want to route it back to our server
                # If we want status updates, we point status_callback to our server's /status endpoint
                call = active_client.calls.create(
                    to=to_number,
                    from_=active_from_number,
                    url=webhook_url,
                    method='POST', # TwiML Bins support GET/POST
                    status_callback=f"{active_webhook_base}/twilio/status",
                    status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                    status_callback_method='POST',
                    timeout=60
                )
            else:
                # Fallback to local webhook (original logic)
                webhook_url = f"{active_webhook_base}/twilio/voice/webhook"
    
                if call_context:
                    encoded_params = []
                    for k, v in call_context.items():
                        key = urllib.parse.quote_plus(str(k))
                        value = urllib.parse.quote_plus(str(v))
                        encoded_params.append(f"{key}={value}")
                    params = "&".join(encoded_params)
                    webhook_url = f"{webhook_url}?{params}"
    
                call = active_client.calls.create(
                    to=to_number,
                    from_=active_from_number,
                    url=webhook_url,
                    method='POST',
                    status_callback=f"{active_webhook_base}/twilio/status",
                    status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                    status_callback_method='POST',
                    timeout=60
                )

            logger.info(f"✅ Call Created — SID: {call.sid}")

            return {"success": True, "call_sid": call.sid, "status": call.status, "webhook_url": webhook_url}

        except Exception as e:
            logger.error(f"❌ outbound call error: {e}")
            return {"success": False, "error": str(e)}

# Create a manager instance that matches the expected interface
class OutboundCallManager(OutboundCallService):
    def __init__(self):
        super().__init__()
    
    async def make_call_with_message(self, to_number: str, message: str, voice: str = "Polly.Joanna") -> Dict:
        # For notification calls, we might want to implement a different flow
        # For now, we'll just use the same make_call method
        return await self.make_call(to_number, {"message": message})

# Initialize the outbound manager
outbound_manager = OutboundCallManager()

async def make_outbound_call(to_number: str, call_context: Optional[Dict] = None, greeting: Optional[str] = None):
    return await outbound_manager.make_call(to_number, call_context, greeting)

async def make_notification_call(to_number: str, message: str, voice: str = "Polly.Joanna"):
    return await outbound_manager.make_call_with_message(to_number, message, voice)

async def get_call_status(call_sid: str):
    # This would need to be implemented to check call status
    return {"status": "not_implemented"}

async def end_call(call_sid: str):
    # This would need to be implemented to hang up calls
    return {"status": "not_implemented"}