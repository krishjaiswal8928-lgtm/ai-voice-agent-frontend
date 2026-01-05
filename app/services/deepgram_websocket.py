"""
Deepgram WebSocket Service for Real-Time Speech-to-Text
"""
import asyncio
import json
import logging
import websockets
import os
from typing import Dict, Callable, Optional, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class DeepgramWebSocketService:
    """Manages WebSocket connections to Deepgram for real-time transcription"""
    
    def __init__(self):
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.transcript_callbacks: Dict[str, Callable] = {}
        self.DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
        self.reconnect_attempts: Dict[str, int] = {}  # Track reconnect attempts per call
        
    async def connect(self, call_sid: str, on_transcript: Callable) -> bool:
        """
        Establish a WebSocket connection to Deepgram for real-time transcription
        
        Args:
            call_sid: Unique identifier for the call
            on_transcript: Callback function to handle transcription results
            
        Returns:
            bool: True if connection successful, False otherwise
        """
        if not self.DEEPGRAM_API_KEY:
            logger.error("DEEPGRAM_API_KEY not found in environment variables")
            return False
            
        # Deepgram WebSocket URL with parameters optimized for real-time transcription
        # Using nova-2-general model with en-IN language for Indian accents
        if call_sid in self.connections:
            logger.warning(f"Connection for {call_sid} already exists. Closing old connection.")
            await self.disconnect(call_sid)
            
        url = f"wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&model=nova-2-phonecall&language=en&smart_formatting=true&interim_results=true&endpointing=300&utterance_end_ms=1000"
        
        headers = {
            "Authorization": f"Token {self.DEEPGRAM_API_KEY}"
        }
        
        try:
            # LATENCY OPTIMIZATION: Faster timeout for quicker retry on failure
            # Reduced from 30s to 10s - if it doesn't connect in 10s, retry faster
            logger.info(f"Attempting to connect to Deepgram WebSocket for call {call_sid}...")
            
            websocket = await asyncio.wait_for(
                websockets.connect(
                    url, 
                    additional_headers=headers,
                    ping_interval=10,  # Reduced from 20s for more frequent keepalive
                    ping_timeout=20,   # Reduced from 30s
                    close_timeout=5,   # Reduced from 10s
                    max_size=None,     # No limit on message size
                    compression=None   # Disable compression for lower latency
                ),
                timeout=10.0  # CRITICAL: Reduced from 30s to 10s for faster retry
            )
            
            # Store connection info
            self.connections[call_sid] = {
                "websocket": websocket,
                "connected": True,
                "language": "en-IN",
                "last_heartbeat": asyncio.get_event_loop().time()
            }
            self.transcript_callbacks[call_sid] = on_transcript
            self.reconnect_attempts[call_sid] = 0  # Reset reconnect attempts
            
            # Start listening for messages
            asyncio.create_task(self._listen_for_messages(call_sid))
            
            # Start keep-alive loop to prevent timeouts during agent speech
            asyncio.create_task(self._keep_alive_loop(call_sid))
            
            logger.info(f"✅ Deepgram WebSocket connected for call {call_sid} with language en-IN")
            return True
            
        except asyncio.TimeoutError:
            logger.error(f"❌ Deepgram WebSocket connection TIMEOUT for call {call_sid} (exceeded 10s)")
            logger.error(f"   This usually indicates network/firewall issues blocking WSS connections")
            logger.error(f"   Attempted URL: wss://api.deepgram.com/v1/listen...")
            return False
        except Exception as e:
            logger.error(f"❌ Failed to connect to Deepgram WebSocket for call {call_sid}: {type(e).__name__}: {e}")
            return False
    
    async def _keep_alive_loop(self, call_sid: str):
        """
        Send silence frames periodically to keep Deepgram connection alive
        when we are not sending real audio (e.g. while Agent is speaking).
        """
        # Silence frame for 8kHz mulaw (approx 20ms)
        # 0xFF is silence in mu-law
        silence_frame = b'\xff' * 160 
        
        try:
            while True:
                if call_sid not in self.connections:
                    break
                    
                connection = self.connections[call_sid]
                if not connection["connected"]:
                    break
                
                # Check last activity
                # If we haven't sent audio recently, send silence
                # Deepgram utterance_end_ms is short (1000ms), so we should send frequently
                # to avoid triggering end-of-utterance if we just paused briefly, 
                # BUT here we mainly want to prevent CONNECTION timeout (which is longer).
                # However, sending silence helps keep the stream "active" logic happy.
                
                try:
                    websocket = connection["websocket"]
                    await websocket.send(silence_frame)
                    # logger.debug(f"Sent keep-alive silence for {call_sid}")
                except Exception:
                    break
                    
                # Send every 150ms (reduced from 200ms for better timeout protection)
                await asyncio.sleep(0.15)
                
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error in keep-alive loop for {call_sid}: {e}")

    async def _listen_for_messages(self, call_sid: str):
        """
        Listen for messages from Deepgram WebSocket and process them
        
        Args:
            call_sid: Unique identifier for the call
        """
        if call_sid not in self.connections:
            logger.error(f"No connection found for call {call_sid}")
            return
            
        websocket = self.connections[call_sid]["websocket"]
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self._handle_deepgram_message(call_sid, data)
                    # Update heartbeat
                    self.connections[call_sid]["last_heartbeat"] = asyncio.get_event_loop().time()
                except json.JSONDecodeError:
                    logger.warning(f"Failed to decode Deepgram message for call {call_sid}")
                except Exception as e:
                    logger.error(f"Error handling Deepgram message for call {call_sid}: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Deepgram WebSocket connection closed for call {call_sid}")
            await self._handle_disconnect(call_sid)
        except Exception as e:
            logger.error(f"Error in Deepgram WebSocket listener for call {call_sid}: {e}")
            await self._handle_disconnect(call_sid)
    
    async def _handle_deepgram_message(self, call_sid: str, data: Dict[str, Any]):
        """
        Handle incoming messages from Deepgram
        
        Args:
            call_sid: Unique identifier for the call
            data: Message data from Deepgram
        """
        try:
            # Handle different types of messages from Deepgram
            if "type" in data:
                if data["type"] == "Results":
                    # Handle transcription results
                    await self._handle_transcription_result(call_sid, data)
                elif data["type"] == "Metadata":
                    # Handle metadata (connection info, etc.)
                    logger.debug(f"Deepgram metadata for call {call_sid}: {data}")
                elif data["type"] == "UtteranceEnd":
                    # Handle end of utterance
                    logger.debug(f"Utterance ended for call {call_sid}")
                elif data["type"] == "SpeechStarted":
                    # Handle speech started event
                    logger.debug(f"Speech started for call {call_sid}")
                elif data["type"] == "Error":
                    # Handle error messages
                    logger.error(f"Deepgram error for call {call_sid}: {data}")
                    
        except Exception as e:
            logger.error(f"Error processing Deepgram message for call {call_sid}: {e}")
    
    async def _handle_transcription_result(self, call_sid: str, data: Dict[str, Any]):
        """
        Handle transcription results from Deepgram
        
        Args:
            call_sid: Unique identifier for the call
            data: Transcription data from Deepgram
        """
        try:
            # Extract transcript from the results
            # Extract transcript from the results
            if "channel" in data:
                channel = data["channel"]
                # robust handling if channel is list or dict
                if isinstance(channel, list) and len(channel) > 0:
                    channel = channel[0]
                
                if isinstance(channel, dict) and "alternatives" in channel:
                    alternatives = channel["alternatives"]
                    if alternatives:
                        transcript_data = alternatives[0]

                    transcript = transcript_data.get("transcript", "").strip()
                    confidence = transcript_data.get("confidence", 0.0)
                    is_final = data.get("is_final", False)
                    
                    # STRICT FILTER: Ignore garbage confidence to prevent false detections
                    if confidence < 0.4:
                        if transcript:
                             # logger.debug(f"Ignoring low confidence transcript: '{transcript}' ({confidence})")
                             pass
                        return

                    # Process transcripts with reasonable confidence
                    # We pass ALL transcripts now to allow Smart Barge-in to decide what to do
                    if transcript:
                         logger.debug(f"Deepgram transcript for call {call_sid}: '{transcript}' (confidence: {confidence:.2f}, final: {is_final})")
                         
                         # Call the registered callback with the transcript
                         if call_sid in self.transcript_callbacks:
                             # Signature expected: (call_sid, transcript, is_final, confidence)
                             await self.transcript_callbacks[call_sid](call_sid, transcript, is_final, confidence)

        except Exception as e:
            logger.error(f"Error handling transcription result for call {call_sid}: {e}")
    
    async def send_audio(self, call_sid: str, audio_data: bytes) -> bool:
        """
        Send audio data to Deepgram for transcription
        
        Args:
            call_sid: Unique identifier for the call
            audio_data: Audio bytes to transcribe
            
        Returns:
            bool: True if data sent successfully, False otherwise
        """
        if call_sid not in self.connections:
            logger.error(f"No Deepgram connection for call {call_sid}")
            return False
            
        connection = self.connections[call_sid]
        if not connection["connected"]:
            logger.error(f"Deepgram connection not active for call {call_sid}")
            return False
            
        try:
            websocket = connection["websocket"]
            await websocket.send(audio_data)
            return True
        except Exception as e:
            logger.error(f"Failed to send audio to Deepgram for call {call_sid}: {e}")
            await self._handle_disconnect(call_sid)
            return False
    
    async def _handle_disconnect(self, call_sid: str):
        """
        Handle disconnection from Deepgram
        
        Args:
            call_sid: Unique identifier for the call
        """
        if call_sid in self.connections:
            connection = self.connections[call_sid]
            websocket = connection["websocket"]
            
            try:
                await websocket.close()
            except:
                pass  # Ignore errors when closing
                
            connection["connected"] = False
            logger.info(f"Deepgram WebSocket disconnected for call {call_sid}")
    
    async def disconnect(self, call_sid: str):
        """
        Disconnect from Deepgram WebSocket
        
        Args:
            call_sid: Unique identifier for the call
        """
        if call_sid in self.connections:
            await self._handle_disconnect(call_sid)
            del self.connections[call_sid]
            
        if call_sid in self.transcript_callbacks:
            del self.transcript_callbacks[call_sid]
            
        if call_sid in self.reconnect_attempts:
            del self.reconnect_attempts[call_sid]
            
        logger.info(f"Deepgram WebSocket fully disconnected for call {call_sid}")

# Global instance
deepgram_ws_service = DeepgramWebSocketService()