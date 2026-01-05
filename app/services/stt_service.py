import os
import httpx
import numpy as np
from dotenv import load_dotenv
import logging
import asyncio
from typing import Optional
from app.services.deepgram_websocket import deepgram_ws_service

# Import Google Cloud Speech
try:
    from google.cloud import speech
    GOOGLE_SPEECH_AVAILABLE = True
except ImportError:
    GOOGLE_SPEECH_AVAILABLE = False
    speech = None

load_dotenv()
logger = logging.getLogger(__name__)

# API Keys - Only keeping Deepgram since that's what we're using
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

# Shared HTTP client for connection pooling with optimized settings
_http_client: httpx.AsyncClient | None = None

# Storage for transcription results from WebSocket
transcription_results = {}
# Callback registry for streaming architecture
# Callback registry for streaming architecture
_transcript_handlers = {}

def register_transcript_handler(call_sid: str, handler):
    """
    Register an async handler function for a specific call.
    Handler signature: async (text, is_final, confidence)
    """
    logger.info(f"✅ Registered handler for call {call_sid}")
    _transcript_handlers[call_sid] = handler


def get_http_client() -> httpx.AsyncClient:
    """
    Shared httpx.AsyncClient for connection pooling and proper timeouts.
    Optimized for performance with higher connection limits and reduced timeouts.
    """
    global _http_client
    if _http_client is None:
        # Increased connection pool size for better concurrency
        limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
        # Increased timeout to reduce timeouts
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(5.0), limits=limits)
    return _http_client

# ---- VAD helper -------------------------------------------------------------

def has_speech(audio_bytes: bytes, threshold: int = 5) -> bool:
    """
    Simple energy-based VAD on 16‑bit PCM.
    Returns False for very quiet / empty buffers to avoid useless STT calls.
    """
    try:
        if not audio_bytes or len(audio_bytes) < 100:
            return False

        audio = np.frombuffer(audio_bytes, dtype=np.int16)
        if len(audio) == 0:
            return False

        energy = float(np.sqrt(np.mean(audio.astype(np.float32) ** 2)))
        logger.info(f"STT audio energy: {energy:.2f}")
        return energy > threshold
    except Exception as e:
        logger.warning(f"Error in VAD: {e}")
        # If unsure, assume speech to avoid dropping real utterances
        return True

# ---- Transcript Normalization --------------------------------------------

def _normalize_transcript(transcript: str) -> str:
    """
    Normalize transcribed text to fix common STT patterns.
    Specifically handles email addresses and phone numbers.
    
    Args:
        transcript: Raw transcript from STT
        
    Returns:
        Normalized transcript
    """
    import re
    
    normalized = transcript
    
    # Email normalization patterns
    # "at gmail dot com" -> "@gmail.com"
    # "at yahoo dot com" -> "@yahoo.com"
    email_patterns = [
        (r'\bat gmail dot com\b', '@gmail.com'),
        (r'\bat yahoo dot com\b', '@yahoo.com'),
        (r'\bat outlook dot com\b', '@outlook.com'),
        (r'\bat hotmail dot com\b', '@hotmail.com'),
        (r'\bat\s+(\w+)\s+dot\s+com\b', r'@\1.com'),  # Generic: "at anything dot com"
        (r'\bat dot com\b', '@.com'),  # Fallback
    ]
    
    for pattern, replacement in email_patterns:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    
    # Phone number patterns (if needed in future)
    # Can add: "double zero" -> "00", etc.
    
    return normalized

# ---- WebSocket transcription callback ----------------------------------------

async def transcription_callback(call_sid: str, transcript: str, confidence: float, is_final: bool):
    """
    Callback function to handle transcription results from Deepgram WebSocket
    
    Args:
        call_sid: Unique identifier for the call
        transcript: Transcribed text
        confidence: Confidence score of the transcription
        is_final: Whether this is a final transcription
    """
    # Normalize transcript first (fix email patterns, etc.)
    transcript = _normalize_transcript(transcript)
    
    # Log significant events
    if is_final:
        logger.info(f"STT Final: '{transcript}' ({confidence:.2f})")
    
    # CRITICAL: Only trigger on final transcripts with sufficient confidence
    # Lowered from 0.9 to 0.8 to prevent cutting off users mid-sentence
    if not is_final or confidence < 0.8:
        return  # Skip low confidence or non-final transcripts
    
    # Prevent single-word or very short utterances from triggering
    # This helps avoid premature triggers during natural pauses
    word_count = len(transcript.strip().split())
    if word_count < 2:
        logger.debug(f"Skipping short utterance: '{transcript}' ({word_count} words)")
        return
    
    # Trigger the handler if registered
    if call_sid in _transcript_handlers:
        logger.info(f"⚡ Triggering registered handler for {call_sid}")
        handler = _transcript_handlers[call_sid]
        try:
            # Create a task to run the async handler effectively
            asyncio.create_task(handler(transcript, is_final, confidence))
        except Exception as e:
            logger.error(f"Error triggering transcript handler for {call_sid}: {e}")
    else:
        logger.warning(f"⚠️ No handler registered for {call_sid} - buffering result")
        # Fallback for legacy polling (though we are moving away from this)
        if call_sid not in transcription_results:
            transcription_results[call_sid] = []
        
        transcription_results[call_sid].append({
        "transcript": transcript,
        "confidence": confidence,
        "is_final": is_final
    })

# ---- Google Cloud Speech fallback -------------------------------------------

async def _transcribe_with_google(audio_bytes: bytes, language_code: str = "en-US") -> str | None:
    """
    Transcribe audio using Google Cloud Speech as fallback
    
    Args:
        audio_bytes: 16‑bit linear PCM at 16 kHz, mono.
        language_code: Language code for transcription
        
    Returns:
        Transcript text or None.
    """
    if not GOOGLE_SPEECH_AVAILABLE or speech is None:
        logger.warning("Google Cloud Speech not available")
        return None
        
    try:
        client = speech.SpeechClient()
        
        # Configure the recognition request
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=language_code,
            enable_automatic_punctuation=True,
            enable_word_time_offsets=True,
        )
        
        audio = speech.RecognitionAudio(content=audio_bytes)
        
        # Perform the transcription
        response = client.recognize(config=config, audio=audio)
        
        # Extract the best transcription
        if response.results:
            result = response.results[0]
            if result.alternatives:
                transcript = result.alternatives[0].transcript
                confidence = result.alternatives[0].confidence
                logger.info(f"Google Cloud Speech transcript: '{transcript}' (confidence: {confidence:.2f})")
                return transcript.strip()
                
        logger.warning("No transcription results from Google Cloud Speech")
        return None
        
    except Exception as e:
        logger.error(f"Error in Google Cloud Speech transcription: {e}")
        return None

# ---- Main STT entrypoint ----------------------------------------------------

async def transcribe_audio_with_provider(provider: str, audio_bytes: bytes, call_sid: str = None) -> str | None:
    """
    Transcribe audio using Deepgram provider with WebSocket streaming when possible.
    
    Args:
        provider: Must be "deepgram"
        audio_bytes: 16‑bit linear PCM at 16 kHz, mono.
        call_sid: Optional call identifier for WebSocket connection management

    Returns:
        Transcript text or None.
    """
    # Validate input
    if not audio_bytes or len(audio_bytes) < 100:
        logger.warning(f"Audio too short for STT: {len(audio_bytes) if audio_bytes else 0} bytes")
        return None

    # Validate provider
    if provider != "deepgram":
        logger.error(f"Unsupported STT provider: {provider}. Only 'deepgram' is supported.")
        return None

    # VAD is handled in orchestrator.py on the raw stream. 
    # The bytes here are now mulaw (not int16), so local energy calc would be wrong.
    # We skip redundant VAD here to ensure we don't drop valid audio.

    # If we have a call_sid, try to use WebSocket streaming
    if call_sid:
        logger.info(f"Attempting WebSocket streaming for call {call_sid}")
        result = await _transcribe_with_websocket(provider, audio_bytes, call_sid)
        # If WebSocket fails, try HTTP as fallback
        if not result:
            logger.warning("WebSocket transcription failed, trying HTTP fallback")
            result = await _transcribe_with_http(provider, audio_bytes)
        return result
    
    # Fall back to HTTP method
    logger.warning("No call_sid provided or WebSocket failed, falling back to HTTP method")
    result = await _transcribe_with_http(provider, audio_bytes)
    return result

async def stream_audio_packet(provider: str, audio_bytes: bytes, call_sid: str) -> bool:
    """
    Non-blocking audio streaming to STT provider.
    Simply pushes audio to the WebSocket and returns immediately.
    """
    if provider != "deepgram":
        logger.warning(f"Streaming only supported for 'deepgram', got '{provider}'")
        return False

    # Ensure connection exists with aggressive retry logic
    if call_sid not in deepgram_ws_service.connections:
        logger.info(f"Initiating new Deepgram stream for call {call_sid}")
        
        # OPTIMIZATION: Aggressive retry on initial connection failure
        max_initial_retries = 3
        for retry_attempt in range(max_initial_retries):
            # We pass our updated callback
            success = await deepgram_ws_service.connect(call_sid, transcription_callback)
            
            if success:
                logger.info(f"✅ Deepgram connected on attempt {retry_attempt + 1}")
                break
            
            if retry_attempt < max_initial_retries - 1:
                # Exponential backoff: 0.5s, 1s
                backoff = 0.5 * (2 ** retry_attempt)
                logger.warning(f"🔄 Retry {retry_attempt + 2}/{max_initial_retries} in {backoff}s...")
                await asyncio.sleep(backoff)
            else:
                logger.error(f"❌ Failed to connect after {max_initial_retries} attempts for call {call_sid}")
                return False

    # Send and forget (non-blocking)
    success = await deepgram_ws_service.send_audio(call_sid, audio_bytes)
    if not success:
        logger.warning(f"Failed to push audio packet for {call_sid}, attempting reconnect")
        
        # Get reconnect attempt count
        retry_count = deepgram_ws_service.reconnect_attempts.get(call_sid, 0)
        max_retries = 3
        
        if retry_count >= max_retries:
            logger.error(f"Max reconnect attempts ({max_retries}) reached for {call_sid}")
            return False
        
        # Exponential backoff: 0.5s, 1s, 2s
        backoff_delay = 0.5 * (2 ** retry_count)
        logger.info(f"Reconnect attempt {retry_count + 1}/{max_retries} after {backoff_delay}s backoff")
        await asyncio.sleep(backoff_delay)
        
        # Increment retry counter
        deepgram_ws_service.reconnect_attempts[call_sid] = retry_count + 1
        
        # Try one reconnect attempt
        if await deepgram_ws_service.connect(call_sid, transcription_callback):
            return await deepgram_ws_service.send_audio(call_sid, audio_bytes)
        return False
    
    return True

async def _transcribe_with_websocket(provider: str, audio_bytes: bytes, call_sid: str) -> str | None:
    """
    Legacy method - retained for backward compatibility if needed, 
    but effectively deprecated by streaming architecture.
    """
    # Just redirect to stream packet mechanism
    await stream_audio_packet(provider, audio_bytes, call_sid)
    return None  # Breaking the blocking contract explicitly

async def _transcribe_with_http(provider: str, audio_bytes: bytes) -> str | None:
    """
    Fallback method using HTTP POST (original implementation)
    """
    logger.info(f"Sending {len(audio_bytes)} bytes to provider '{provider}' via HTTP for transcription")

    # Retry logic for Deepgram
    max_retries = 3  # Increased retries
    retry_delay = 0.1  # Reduced delay for faster fallback
    
    for attempt in range(max_retries):
        try:
            # ------------- Deepgram HTTP /v1/listen ------------------------
            if not DEEPGRAM_API_KEY:
                logger.error("Missing DEEPGRAM_API_KEY")
                return None

            # Fix: Use v1 API instead of v2 which was causing 405 errors
            url = "https://api.deepgram.com/v1/listen"
            
            # Headers
            headers = {
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "audio/raw",
            }
            
            # Query parameters - using nova-2-general model with en-IN
            params = {
                "model": "nova-2-general",
                "language": "en-IN",
                "encoding": "mulaw",
                "sample_rate": 8000,
                "channels": 1,
                "punctuate": "true",
                "smart_format": "true",
                "filler_words": "false",
            }

            client = get_http_client()

            try:
                response = await client.post(
                    url,
                    headers=headers,
                    params=params,
                    content=audio_bytes,
                    timeout=8.0  # Increased timeout for Deepgram API processing
                )
                logger.info(f"Deepgram response status: {response.status_code}")

                if response.status_code != 200:
                    logger.error(f"Deepgram API error {response.status_code} - {response.text}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return None

                data = response.json()
                logger.debug(f"Deepgram full response: {data}")

                # Basic safety checks
                if "results" not in data or not data["results"]:
                    logger.warning("No results in Deepgram response")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return None

                # Get best final alternative
                alt = (
                    data.get("results", {})
                    .get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                )
                transcript = alt.get("transcript", "") or ""
                confidence = float(alt.get("confidence", 0.0))
                cleaned = transcript.strip()

                logger.info(f"Deepgram transcript: '{cleaned}' (confidence: {confidence:.2f})")

                # Empty or ultra-short transcript: treat as no speech
                if not cleaned or len(cleaned) < 1:
                    logger.warning("Transcript too short or empty")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return None

                # Accept even very low confidence transcripts to improve responsiveness
                if confidence < 0.001:  # Only filter out extremely low confidence
                    logger.warning(f"Extremely low confidence transcript filtered out: {confidence:.3f}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return None

                return cleaned

            except httpx.TimeoutException:
                logger.error(f"Deepgram request timed out (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
                return None

            except Exception as e:
                logger.error(f"Deepgram request error (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
                return None

        except Exception as e:
            logger.error(f"STT error with provider {provider}: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            return None

    return None

# Backwards‑compatibility wrappers
async def transcribe_audio_direct(audio_bytes: bytes) -> str | None:
    return await transcribe_audio_with_provider("deepgram", audio_bytes, None)

async def transcribe_audio_stream(audio_generator):
    audio_chunks = []
    async for chunk in audio_generator:
        audio_chunks.append(chunk)
    full_audio = b"".join(audio_chunks)
    result = await transcribe_audio_with_provider("deepgram", full_audio, None)
    if result:
        yield result