import os
from typing import Optional
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
from app.core.utils import format_phone_number

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_number = os.getenv("TWILIO_NUMBER")
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def make_call(self, to_phone: str, webhook_url: str) -> Optional[str]:
        """Make a call using Twilio."""
        if not self.client:
            return None
            
        try:
            call = self.client.calls.create(
                to=format_phone_number(to_phone),
                from_=self.twilio_number,
                url=webhook_url
            )
            return call.sid
        except Exception as e:
            print(f"Error making call: {e}")
            return None

    def send_sms(self, to_phone: str, message: str) -> Optional[str]:
        """Send an SMS using Twilio."""
        if not self.client:
            return None
            
        try:
            message = self.client.messages.create(
                to=format_phone_number(to_phone),
                from_=self.twilio_number,
                body=message
            )
            return message.sid
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return None

    def generate_voice_response(self, message: str) -> str:
        """Generate a TwiML response for voice calls."""
        response = VoiceResponse()
        response.say(message)
        response.hangup()
        return str(response)

    def validate_webhook_request(self, request_data: dict) -> bool:
        """Validate a Twilio webhook request."""
        # In a production environment, you should validate the request
        # using Twilio's request validation mechanism
        return True

# Add the missing functions that voice_routes.py is trying to import
def handle_incoming_call(form_data: dict) -> str:
    """Handle incoming calls from Twilio."""
    # Import configuration
    from app.routes.twilio_routes import WEBSOCKET_URL
    
    # Create a voice response that connects to WebSocket for voice agent
    response = VoiceResponse()
    connect = Connect()
    stream = Stream(url=WEBSOCKET_URL)
    stream.parameter(name="call_sid", value=form_data.get("CallSid", "unknown"))
    stream.parameter(name="phone_number", value=form_data.get("From", "unknown"))
    connect.append(stream)
    response.append(connect)
    return str(response)

def handle_call_status(form_data: dict) -> dict:
    """Handle call status updates from Twilio."""
    # Log the call status (in a real implementation, you might store this in a database)
    call_sid = form_data.get("CallSid", "unknown")
    call_status = form_data.get("CallStatus", "unknown")
    print(f"Call {call_sid} status: {call_status}")
    
    # Handle call completion and cleanup
    if call_status in ["completed", "failed", "busy", "no-answer"]:
        from app.agent.orchestrator import cleanup_conversation
        cleanup_conversation(call_sid)
    
    return {"status": "received"}