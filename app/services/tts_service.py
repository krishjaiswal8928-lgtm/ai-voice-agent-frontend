# app/services/tts_service.py
"""
Text-to-Speech Service with support for multiple providers
Returns PCM audio bytes directly
"""
print("DEBUG: tts_service: Importing os...", flush=True)
import os
print("DEBUG: tts_service: Importing logging...", flush=True)
import logging
from typing import Optional
print("DEBUG: tts_service: Importing dotenv...", flush=True)
from dotenv import load_dotenv
import io

print("DEBUG: tts_service: Loading .env...", flush=True)
load_dotenv()

logger = logging.getLogger(__name__)
print("DEBUG: tts_service: Imports/Init finished.", flush=True)

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Google Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Deepgram Configuration
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

# Cartesia Configuration
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY")
CARTESIA_MODEL_ID = "sonic-3"

# Cartesia Voice IDs
CARTESIA_ENGLISH_VOICE = "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"  # Tessa - Friendly Female
CARTESIA_HINDI_VOICE = "694f9389-aac1-45b6-b726-9d9369183238"  # Aadhya - Hindi Female
CARTESIA_HINGLISH_VOICE = "846d6cb0-2301-48b6-9683-48f5618ea2f6"  # Apoorva - Hinglish Female

# Global clients (lazy initialized)
_polly_client = None
_google_tts_client = None
_openai_client = None
_cartesia_client = None

def get_polly_client():
    global _polly_client
    if _polly_client is None and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        try:
            import boto3
            _polly_client = boto3.client(
                'polly',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_REGION
            )
            logger.info("✅ AWS Polly initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Polly: {e}")
    return _polly_client

def get_google_tts_client():
    global _google_tts_client
    if _google_tts_client is None and GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            _google_tts_client = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("✅ Google TTS initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Google TTS: {e}")
    return _google_tts_client

def get_openai_client():
    global _openai_client
    if _openai_client is None and OPENAI_API_KEY:
        try:
            import openai
            _openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
            logger.info("✅ OpenAI TTS initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize OpenAI TTS: {e}")
    return _openai_client

def get_cartesia_client():
    global _cartesia_client
    if _cartesia_client is None and CARTESIA_API_KEY:
        try:
            from cartesia import Cartesia
            _cartesia_client = Cartesia(api_key=CARTESIA_API_KEY)
            logger.info("✅ Cartesia TTS initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Cartesia TTS: {e}")
    return _cartesia_client


def validate_tts_provider(provider: str) -> str:
    """
    Validate TTS provider and return a supported provider.
    Falls back to 'aws_polly' if provider is not supported.
    
    Args:
        provider: Requested TTS provider
        
    Returns:
        str: Validated/supported TTS provider
    """
    supported_providers = {"aws_polly", "gemini", "openai", "cartesia"}
    
    if provider in supported_providers:
        return provider
    
    # Log warning for invalid provider
    if provider:
        logger.warning(f"Invalid TTS provider '{provider}' specified, falling back to 'cartesia'")
    else:
        logger.warning("No TTS provider specified, using default 'cartesia'")
    
    return "cartesia"


async def synthesize_speech_with_provider(provider: str, text: str, voice_id: Optional[str] = None) -> Optional[bytes]:
    """
    Synthesize speech using the specified provider

    Args:
        provider: TTS provider to use (aws_polly, gemini, openai)
        text: Text to convert to speech
        voice_id: Voice to use (provider-specific)

    Returns:
        PCM audio bytes @ 16kHz or None if failed
    """
    # Validate and normalize provider
    provider = validate_tts_provider(provider)

    if not text or not text.strip():
        logger.warning("Empty text provided for TTS")
        return None

    text = text.strip()
    logger.info(f"Synthesizing speech with {provider}: {text[:50]}...")

    try:
        if provider == "aws_polly":
            client = get_polly_client()
            if not client:
                logger.error("Polly client not initialized")
                return None

            # Auto-detect language
            if not voice_id:
                is_hindi = any('\u0900' <= ch <= '\u097F' for ch in text)
                voice_id = "Aditi" if is_hindi else "Joanna"

            # Synthesize speech
            try:
                response = client.synthesize_speech(
                    Text=text,
                    OutputFormat='pcm',
                    VoiceId=voice_id,
                    Engine='neural',  # Use neural for better quality
                    SampleRate='16000',
                    TextType='text'
                )

                # Read audio stream
                if 'AudioStream' in response:
                    audio_bytes = response['AudioStream'].read()
                    if audio_bytes and len(audio_bytes) > 0:
                        logger.info(f"AWS Polly generated {len(audio_bytes)} bytes of audio")
                        return audio_bytes
                    else:
                        logger.warning("AWS Polly returned empty audio stream")
                        return None
                else:
                    logger.warning("AWS Polly response missing AudioStream")
                    return None
            except Exception as e:
                logger.error(f"AWS Polly error: {e}")
                return None

        elif provider == "gemini":
            if not GEMINI_API_KEY:
                logger.error("Gemini API key not configured")
                return None

            try:
                # Use Google's TTS API directly since Gemini doesn't have a dedicated TTS model
                # We'll use the Google Cloud Text-to-Speech API
                from google.cloud import texttospeech
                
                # Initialize the client
                client = texttospeech.TextToSpeechClient()
                
                # Set the text input to be synthesized
                synthesis_input = texttospeech.SynthesisInput(text=text)
                
                # Build the voice request
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Standard-C" if not voice_id else voice_id
                )
                
                # Select the type of audio file you want returned
                audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                    sample_rate_hertz=16000
                )
                
                # Perform the text-to-speech request
                response = client.synthesize_speech(
                    input=synthesis_input, voice=voice, audio_config=audio_config
                )
                
                # Return the audio content
                if response.audio_content:
                    audio_bytes = response.audio_content
                    logger.info(f"Google TTS generated {len(audio_bytes)} bytes of audio")
                    return audio_bytes
                else:
                    logger.error("Gemini TTS returned empty audio content")
                    return None
                    
            except ImportError:
                logger.error("Google Cloud Text-to-Speech library not installed")
                return None
            except Exception as e:
                logger.error(f"Google TTS error: {e}")
                return None

        elif provider == "openai":
            client = get_openai_client()
            if not client:
                logger.error("OpenAI client not initialized")
                return None

            # Synthesize speech with OpenAI (using tts-1-hd for lower latency)
            try:
                response = client.audio.speech.create(
                    model="tts-1-hd",  # HD model has lower latency than standard tts-1
                    voice=voice_id or "alloy",
                    input=text,
                    response_format="pcm"  # Request PCM directly for faster processing
                )
                
                # Convert to PCM bytes
                audio_bytes = response.content
                if audio_bytes and len(audio_bytes) > 0:
                    logger.info(f"OpenAI TTS generated {len(audio_bytes)} bytes of audio")
                    return audio_bytes
                else:
                    logger.warning("OpenAI TTS returned empty audio content")
                    return None
            except Exception as e:
                if "insufficient_quota" in str(e):
                    logger.error("OpenAI TTS quota exceeded")
                    return None
                else:
                    logger.error(f"OpenAI TTS error: {e}")
                    return None


        elif provider == "cartesia":
            client = get_cartesia_client()
            if not client:
                logger.error("Cartesia client not initialized")
                return None

            try:
                # Auto-detect language if voice not specified
                # Default to Apoorva (Hinglish) for best bilingual support
                if not voice_id:
                    is_hindi = any('\u0900' <= ch <= '\u097F' for ch in text)
                    has_english = any(ch.isalpha() and ord(ch) < 128 for ch in text)
                    
                    if is_hindi and not has_english:
                        voice_id = CARTESIA_HINDI_VOICE  # Pure Hindi → Aadhya
                        lang = "Hindi"
                    else:
                        voice_id = CARTESIA_HINGLISH_VOICE  # Default: Apoorva (Hinglish)
                        lang = "Hinglish/English"
                    
                    logger.info(f"Auto-selected voice: {lang}")

                # Generate audio using Cartesia bytes API (for non-streaming)
                # Note: True streaming happens in synthesize_speech_stream()
                # OPTIMIZATION: Use raw PCM to avoid WAV container overhead
                output = client.tts.bytes(
                    model_id=CARTESIA_MODEL_ID,
                    transcript=text,
                    voice={
                        "mode": "id",
                        "id": voice_id
                    },
                    output_format={
                        "container": "raw",  # Raw PCM for faster processing
                        "encoding": "pcm_s16le",
                        "sample_rate": 16000
                    },
                    language="en"  # Hint for faster processing
                )
                
                # Collect audio data
                audio_bytes = b""
                for chunk in output:
                    audio_bytes += chunk
                
                if audio_bytes and len(audio_bytes) > 0:
                    logger.info(f"Cartesia TTS generated {len(audio_bytes)} bytes of audio")
                    return audio_bytes
                else:
                    logger.error("Cartesia TTS returned empty audio")
                    return None
                    
            except Exception as e:
                logger.error(f"Cartesia TTS error: {e}")
                import traceback
                traceback.print_exc()
                return None

        else:
            logger.error(f"Unsupported TTS provider: {provider}")
            return None

    except Exception as e:
        # Import lazily to avoid top-level dependency
        try:
            from botocore.exceptions import BotoCoreError, ClientError
            if isinstance(e, (ClientError, BotoCoreError)):
                logger.error(f"TTS error with provider {provider}: {e}")
                return None
        except ImportError:
            pass
            
        logger.error(f"TTS error with provider {provider}: {e}")
        return None

# Keep the original function for backward compatibility
async def synthesize_speech(text: str, voice_id: Optional[str] = None) -> Optional[bytes]:
    """
    Synthesize speech using AWS Polly (backward compatibility)
    """
    return await synthesize_speech_with_provider("aws_polly", text, voice_id)


async def synthesize_speech_stream(provider: str, text: str, voice_id: Optional[str] = None):
    """
    Stream speech synthesis audio chunks.
    
    Args:
        provider: TTS provider (aws_polly, gemini, openai)
        text: Text to synthesize
        voice_id: Optional voice ID
        
    Yields:
        bytes: Audio chunks (PCM 16k)
    """
    # Validate and normalize provider
    provider = validate_tts_provider(provider)
    
    if not text or not text.strip():
        return

    text = text.strip()
    
    try:
        if provider == "aws_polly":
            client = get_polly_client()
            if not client:
                logger.error("Polly client not initialized")
                return

            # Auto-detect language if voice not specified
            if not voice_id:
                is_hindi = any('\u0900' <= ch <= '\u097F' for ch in text)
                voice_id = "Aditi" if is_hindi else "Joanna"

            response = client.synthesize_speech(
                Text=text,
                OutputFormat='pcm',
                VoiceId=voice_id,
                Engine='neural',
                SampleRate='16000',
                TextType='text'
            )
            
            if 'AudioStream' in response:
                # AWS Polly AudioStream is a botocore.response.StreamingBody
                # Read in chunks
                stream = response['AudioStream']
                chunk_size = 1024 # 1KB chunks
                
                # If the stream supports iteration (it should):
                for chunk in stream.iter_chunks(chunk_size=chunk_size):
                    if chunk:
                        yield chunk
            else:
                 logger.error("AWS Polly response missing AudioStream")

        elif provider == "gemini":
            # Google TTS doesn't support true streaming via their standard client easily for this setup
            # So we fallback to synthesizing full audio and yielding it as one big chunk
            full_audio = await synthesize_speech_with_provider("gemini", text, voice_id)
            if full_audio:
                yield full_audio

        elif provider == "openai":
            # OpenAI TTS API also returns a full response usually, unless using 'stream' param
            client = get_openai_client()
            if not client:
                 return
                 
            try:
                response = client.audio.speech.create(
                    model="tts-1-hd",  # HD model for lower latency
                    voice=voice_id or "alloy",
                    input=text,
                    response_format="pcm"  # PCM for faster processing
                )
                
                audio_bytes = response.content
                if audio_bytes:
                    yield audio_bytes

            except Exception as e:
                logger.error(f"OpenAI TTS Stream Error: {e}")

        elif provider == "cartesia":
            # Cartesia TTS - Using SSE for REAL streaming (not blocking)
            client = get_cartesia_client()
            if not client:
                return
                
            try:
                # Auto-detect language if voice not specified
                if not voice_id:
                    is_hindi = any('\u0900' <= ch <= '\u097F' for ch in text)
                    has_english = any(ch.isalpha() and ord(ch) < 128 for ch in text)
                    
                    if is_hindi and has_english:
                        voice_id = CARTESIA_HINGLISH_VOICE
                    elif is_hindi:
                        voice_id = CARTESIA_HINDI_VOICE
                    else:
                        voice_id = CARTESIA_ENGLISH_VOICE

                # Use SSE for TRUE streaming - chunks arrive in real-time!
                logger.info(f"Starting Cartesia SSE streaming for text: {text[:50]}...")
                
                # SSE method REQUIRES model_id and streams chunks as they're generated
                output = client.tts.sse(
                    model_id=CARTESIA_MODEL_ID,
                    transcript=text,
                    voice={
                        "mode": "id",
                        "id": voice_id
                    },
                    output_format={
                        "container": "raw",  # Raw PCM for streaming
                        "encoding": "pcm_s16le",
                        "sample_rate": 16000
                    },
                    language="en"  # Language hint for faster processing
                )
                
                # Stream chunks as they arrive in REAL-TIME
                import base64
                chunk_count = 0
                for event in output:
                    # SSE events have 'data' attribute with base64 audio
                    if hasattr(event, 'data') and event.data:
                        try:
                            audio_bytes = base64.b64decode(event.data)
                            if audio_bytes:
                                chunk_count += 1
                                yield audio_bytes  # Yield immediately as chunks arrive!
                        except Exception as decode_error:
                            logger.error(f"Failed to decode chunk: {decode_error}")
                
                logger.info(f"✅ Cartesia streamed {chunk_count} audio chunks via SSE")

            except Exception as e:
                logger.error(f"Cartesia TTS Stream Error: {e}")






        else:
            # Fallback for others
            full_audio = await synthesize_speech_with_provider(provider, text, voice_id)
            if full_audio:
                yield full_audio

    except Exception as e:
        logger.error(f"Streaming TTS error with {provider}: {e}")

        


                




