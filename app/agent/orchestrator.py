import asyncio
import time
import logging
import audioop
import numpy as np
import random
from typing import Optional, List, Dict, Any
from scipy.signal import resample_poly

logger = logging.getLogger(__name__)

from app.services.stt_service import transcribe_audio_with_provider
from app.services.tts_service import synthesize_speech_with_provider
from app.services.llm_service import generate_response, generate_response_stream
from app.models.conversation import Conversation
from app.database.firestore import db as firestore_db
from app.models.custom_agent import CustomAgent
from app.agent.memory_store import MemoryStore
from app.agent.autonomous.agent import AutonomousAgent, create_agent
# Make LangGraphAgent import optional to prevent startup failures
try:
    from app.agent.autonomous.langgraph_agent import LangGraphAgent
    LANGGRAPH_AVAILABLE = True
except ImportError as e:
    logger.warning(f"LangGraphAgent not available: {e}")
    LANGGRAPH_AVAILABLE = False
    LangGraphAgent = None
from app.services.retriever_service import get_relevant_context
from app.services.excel_exporter import export_conversation_to_csv

active_conversations: Dict[str, "ConversationState"] = {}
memory_store = MemoryStore()


async def _fetch_custom_agent(agent_id: Optional[str]) -> Optional[CustomAgent]:
    """
    Safely fetch custom agent from Firestore with comprehensive error handling and diagnostics.
    """
    try:
        if not agent_id:
            logger.warning("Custom agent ID not provided")
            return None
        agent_id_str = str(agent_id).strip()
        if not agent_id_str:
            logger.warning("Custom agent ID is empty after stripping")
            return None

        # Verify Firestore is initialized
        if firestore_db is None:
            logger.error("Firestore DB is None - initialization failed; cannot fetch custom agent")
            return None

        logger.info(f"🔍 Fetching custom agent with ID: '{agent_id_str}' from collection 'custom_agents'")
        doc_ref = firestore_db.collection("custom_agents").document(agent_id_str)
        try:
            doc = doc_ref.get()
        except Exception as e:
            logger.error(f"Error calling Firestore .get() for agent '{agent_id_str}': {e}", exc_info=True)
            return None

        if getattr(doc, "exists", False):
            try:
                data = doc.to_dict() or {}
                logger.info(f"✅ Custom agent document found; keys: {list(data.keys())}")
                custom_agent = CustomAgent.from_dict(data, doc.id)
                logger.info(f"✅ Loaded custom agent: {custom_agent.name} (ID: {custom_agent.id})")
                return custom_agent
            except Exception as parse_err:
                logger.error(f"Failed to parse custom agent document '{agent_id_str}': {parse_err}", exc_info=True)
                return None
        else:
            logger.warning(f"❌ No custom agent found with ID: '{agent_id_str}'")
            # Debug: list a few available docs to help diagnose collection name/permissions
            try:
                preview = firestore_db.collection("custom_agents").limit(5).stream()
                ids = [d.id for d in preview]
                logger.info(f"📋 Available agent IDs (first 5): {ids}")
            except Exception as list_err:
                logger.error(f"Error listing custom_agents collection: {list_err}")
            return None
    except Exception as e:
        logger.error(f"Unexpected error fetching custom agent '{agent_id}': {e}", exc_info=True)
        return None


def _generate_natural_greeting(agent_name: str, company_name: str, goal: str, lead_name: Optional[str] = None) -> str:
    """
    Generate a natural, human-like greeting based on the goal type.
    
    Args:
        agent_name: Name of the agent
        company_name: Name of the company
        goal: The goal or purpose of the call
        lead_name: Name of the lead (optional)
        
    Returns:
        A natural greeting string
    """
    # 1. Personalized greeting if lead name is known (Highest Priority)
    # 1. Personalized greeting if lead name is known (Highest Priority)
    if lead_name and len(lead_name.strip()) > 0:
        return f"Hi, am I talking with {lead_name}?"

    # 2. Generic Greeting (No Name) - Intro + Goal
    
    # Sanitize inputs
    agent_name = _sanitize_name_for_speech(agent_name, "Aditi")
    company_name = _sanitize_name_for_speech(company_name, "Digitale")
    goal = goal.strip()
    
    # Clean up goal text to remove common prefixes for natural flow
    cleaned_goal = goal
    for prefix in ['try to ', 'please ', 'you should ', 'goal is to ', 'objective is to ']:
        if cleaned_goal.lower().startswith(prefix):
            cleaned_goal = cleaned_goal[len(prefix):]
    
    # Capitalize first letter
    if cleaned_goal and cleaned_goal[0].islower():
        cleaned_goal = cleaned_goal[0].upper() + cleaned_goal[1:]

    # Construct the intro
    intro = f"Hello! This is {agent_name} calling from {company_name}."
    
    # Combine intro with goal/opener
    # If goal is short/simple, use it directly. If it's complex, use a generic opener.
    if len(cleaned_goal) > 100 or any(word in cleaned_goal.lower() for word in ['try to', 'attempt to']):
        return f"{intro} How can I help you today?"
    
    return f"{intro} I'm calling regarding {cleaned_goal}. How are you today?"


def _sanitize_name_for_speech(name: str, fallback: str) -> str:
    """
    Sanitize agent/company names to prevent placeholder leakage.
    If name looks like a placeholder, return fallback.
    """
    if not name:
        return fallback
    
    name_lower = name.lower().strip()
    placeholders = ["[your name]", "your name", "[your company]", "your company", "insert name", "[name]"]
    
    if any(p in name_lower for p in placeholders) or "{" in name or "[" in name:
        return fallback
        
    return name


TWILIO_SAMPLE_RATE = 8000
TARGET_SAMPLE_RATE = 16000
SAMPLE_WIDTH = 2  # 16‑bit after ulaw2lin

MIN_AUDIO_LENGTH = 4000    # Increased to 0.5s (8000 bytes/s) to ensure meaningful chunks for STT
# Aggressive streaming fix: Increase minimum tokens before first churn
STREAMING_MIN_TOKENS = 15
SILENCE_TIMEOUT = 3.0     # Increased to 3s to allow for natural pauses
POST_TTS_DELAY = 0.05     # Reduced to 0.05s for faster response (was 0.2s)
MAX_BUFFER_SIZE = 160000
MAX_HISTORY_MESSAGES = 10

STT_TIMEOUT = 20.0  # Further increased to prevent Deepgram timeouts
LLM_TIMEOUT = 15.0  # Increased for better response generation
TTS_TIMEOUT = 12.0  # Increased for better synthesis
STREAMING_MIN_TOKENS = 10


class ConversationState:
    def __init__(
        self,
        call_sid: str,
        goal: Optional[str] = None,
        campaign_id: Optional[str] = None,
        phone_number: Optional[str] = None,
        lead_id: Optional[str] = None,
        lead_name: Optional[str] = None,
        custom_agent_id: Optional[str] = None,
    ):
        self.call_sid = call_sid
        self.goal = goal
        self.campaign_id = campaign_id
        self.phone_number = phone_number
        self.lead_id = lead_id
        self.lead_name = lead_name
        self.custom_agent_id = custom_agent_id

        self.audio_buffer = bytearray()
        self.last_audio_time = asyncio.get_event_loop().time()
        self.outbound_audio_queue = asyncio.Queue()  # Queue for storing TTS audio to be sent to user
        self.is_processing = False # Flag to prevent overlapping LLM calls if needed

        self.processing = False
        self.is_speaking = False
        self.call_start_time = time.time()
        self.stt_retry_count = 0
        self.fallback_count = 0
        self.conversation_history: List[Dict[str, str]] = []
        self.autonomous_agent: Optional[AutonomousAgent] = None
        self.langgraph_agent: Optional[LangGraphAgent] = None
        self.needs_greeting = True
        self.first_interaction = True
        self.barge_in_count = 0
        self.consecutive_empty_transcripts = 0
        self.last_successful_transcript_time = time.time()
        
        # Dynamic audio threshold handling with improved calibration
        self.noise_floor = 0.0
        self.energy_samples = []
        self.calibration_complete = False
        self.calibration_samples = 0
        self.calibration_samples = 0
        self.base_threshold = 100  # Lower base threshold for better sensitivity
        self.is_signal_connected = False # Flag to track if STT callback is registered
        self.current_response_task: Optional[asyncio.Task] = None # Track current response generation task
        self.silence_timer_task: Optional[asyncio.Task] = None # Track silence monitoring
        self.reprompt_count = 0 # Track number of reprompts per turn

        active_conversations[call_sid] = self
        print("\n" + "=" * 60)
        print(f"CALL STARTED – CallSID: {call_sid}")
        print("=" * 60 + "\n")

    def get_stats(self) -> Dict[str, Any]:
        return {
            "call_sid": self.call_sid,
            "goal": self.goal,
            "campaign_id": self.campaign_id,
            "phone_number": self.phone_number,
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "custom_agent_id": self.custom_agent_id,
            "audio_buffer_size": len(self.audio_buffer),
            "last_audio_time": self.last_audio_time,
            "processing": self.processing,
            "is_speaking": self.is_speaking,
            "call_duration": time.time() - self.call_start_time,
            "conversation_turns": len(self.conversation_history),
            "stt_retry_count": self.stt_retry_count,
            "fallback_count": self.fallback_count,
            "barge_in_count": self.barge_in_count,
            "consecutive_empty_transcripts": self.consecutive_empty_transcripts,
            "calibration_complete": self.calibration_complete
        }

    def get_call_duration(self) -> float:
        """Get call duration in seconds"""
        return time.time() - self.call_start_time

    def add_message(self, role: str, content: str):
        self.conversation_history.append({"role": role, "content": content})

    def clear_buffer(self):
        self.audio_buffer = bytearray()


def convert_ulaw_8k_to_linear16_16k(raw_ulaw: bytes) -> Optional[bytes]:
    """
    Twilio 8 kHz μ‑law -> 16‑bit PCM 16 kHz mono.
    """
    try:
        if not raw_ulaw:
            return None
        linear_8k = audioop.ulaw2lin(raw_ulaw, SAMPLE_WIDTH)
        audio_np = np.frombuffer(linear_8k, dtype=np.int16).astype(np.float32)

        # Moderate gain for better speech detection without distortion
        audio_np *= 3.0
        audio_np = np.clip(audio_np, -32768, 32767)

        # Resample 8k -> 16k
        audio_16k = resample_poly(audio_np, up=2, down=1)
        audio_16k = np.clip(audio_16k, -32768, 32767).astype(np.int16)

        energy = float(np.sqrt(np.mean(audio_16k.astype(np.float32) ** 2)))
        logger.info(f"Audio energy after amplification: {energy:.2f}")
        if energy < 1.0:  # Very low threshold to catch quiet speech
            logger.warning(f"Audio still too quiet after boost: {energy:.2f}")
            return None

        return audio_16k.tobytes()
    except Exception as e:
        logger.error(f"Error in audio conversion pipeline: {e}")
        return None


def amplify_audio(audio_bytes: bytes, factor: float = 2.0) -> bytes:
    """
    Amplify μ-law audio bytes by a given factor.
    """
    try:
        # Convert μ-law to linear PCM
        linear_pcm = audioop.ulaw2lin(audio_bytes, SAMPLE_WIDTH)
        
        # Convert to numpy array for easier manipulation
        audio_array = np.frombuffer(linear_pcm, dtype=np.int16).astype(np.float32)
        
        # Apply amplification
        audio_array *= factor
        
        # Clip to prevent overflow
        audio_array = np.clip(audio_array, -32768, 32767)
        
        # Convert back to int16
        amplified_linear = audio_array.astype(np.int16)
        
        # Convert back to μ-law
        amplified_ulaw = audioop.lin2ulaw(amplified_linear.tobytes(), SAMPLE_WIDTH)
        
        return amplified_ulaw
    except Exception as e:
        logger.error(f"Error amplifying audio: {e}")
        return audio_bytes  # Return original if amplification fails


def has_speech_bytes(audio_bytes: bytes, threshold: int = 50) -> bool:
    """
    Simple energy-based VAD directly on μ‑law stream for barge‑in/buffer gating.
    """
    try:
        if not audio_bytes or len(audio_bytes) < 100:
            return False

        linear_pcm = audioop.ulaw2lin(audio_bytes, SAMPLE_WIDTH)
        audio = np.frombuffer(linear_pcm, dtype=np.int16)
        if len(audio) == 0:
            return False
        energy = float(np.sqrt(np.mean(audio.astype(np.float32) ** 2)))
        print(f"Audio energy: {energy:.2f}, threshold: {threshold}")
        # Use dynamic threshold based on calibration
        return energy > threshold
    except Exception as e:
        print(f"Error in VAD: {e}")
        # If we cannot determine, assume speech so we do not drop utterances
        return True


async def monitor_silence(state: ConversationState):
    """
    Background task to detect silence - DISABLED per user request.
    No longer sends reprompts like "Are you still there?"
    """
    # DISABLED: User requested to remove this logic entirely
    return
    
    # Original code commented out
    # try:
    #     await asyncio.sleep(20.0) # Wait 20 seconds (Increased from 10s)
        
    #     # If we are still here and not speaking/processing
    #     if not state.is_speaking and not state.is_processing and not state.current_response_task:
    #         if state.reprompt_count >= 1:
    #             logger.debug("⏳ Silence detected but max reprompts reached. Staying silent.")
    #             return

    #         logger.info("⏳ Silence detected (20s). Sending gentle reprompt.")
    #         state.reprompt_count += 1
            
    #         # Simple rotation of reprompts could be added here
    #         prompt = "Are you still there?"
            
    #         # Synthesize STREAMING
    #         from app.services.tts_service import synthesize_speech_stream
            
    #         async for chunk in synthesize_speech_stream("cartesia", prompt):
    #             if chunk:
    #                 state.outbound_audio_queue.put_nowait(chunk)
    #                 if not state.is_speaking:
    #                      state.is_speaking = True
            
    #         # Reset state will be called again after this speech, restarting the timer loop
    #         asyncio.create_task(reset_speaking_state(state))
                
    # except asyncio.CancelledError:
    #     pass
    # except Exception as e:
    #     logger.error(f"Error in silence monitor: {e}")


async def handle_transcript_event(transcript: str, is_final: bool, confidence: float, call_sid: str):
    state = active_conversations.get(call_sid)
    if not state:
        return

    # Ignore low confidence garbage (e.g. 0.00 from empty/noise)
    if confidence < 0.4 or (transcript and len(transcript.strip()) == 0):
        # Explicitly ignore 0.00 confidence
        if confidence == 0.0:
             return
        logger.debug(f"📉 Ignoring low confidence ({confidence:.2f}) transcript: '{transcript}'")
        return

    # Cancel silence timer if it's running (active user input)
    if state.silence_timer_task:
        state.silence_timer_task.cancel()
        state.silence_timer_task = None
    
    # Reset reprompt count as user has spoken
    if is_final:
        state.reprompt_count = 0

    # Smart Barge-in Logic
    # Check if we are currently speaking OR generating a response
    contact_active = state.is_speaking or (state.current_response_task and not state.current_response_task.done())
    
    if contact_active:
         is_long_enough = len(transcript.split()) >= 2
         
         cleaned_transcript = transcript.lower().strip(".?! ")
         is_generic = cleaned_transcript in {"okay", "ok", "yeah", "yes", "hello", "right", "uh-huh"}
         
         if (not is_final and not is_long_enough) or (is_final and is_generic):
             logger.info(f"🛡️ Smart Barge-in: Ignoring '{transcript}' (Generic/Short) while speaking.")
             return
         
         logger.info(f"🛑 Smart Barge-in detected! Transcript: '{transcript}'")
         
         # 1. Cancel the specific response generation task
         if state.current_response_task and not state.current_response_task.done():
             state.current_response_task.cancel()
             logger.info("❌ Cancelled previous response generation task")
         
         # 2. Clear queued audio (Stop TTS playback immediately)
         while not state.outbound_audio_queue.empty():
             try:
                 state.outbound_audio_queue.get_nowait()
             except asyncio.QueueEmpty:
                 break
         
         # 3. Stop speaking state immediately (so we can listen)
         state.is_speaking = False

    logger.info(f"🗣️ Handling Transcript: '{transcript}'")
    
    state.is_processing = True
    # Start response generation (Cancel old one if exists - already done above, but safe to overwrite)
    state.current_response_task = asyncio.create_task(_generate_and_stream_response(state, transcript))


async def calibrate_noise_floor(state: ConversationState, audio_bytes: bytes) -> float:
    """
    Calibrate noise floor based on first few seconds of audio with improved logic
    
    Args:
        state: Conversation state containing calibration data
        audio_bytes: Audio bytes to sample for calibration
        
    Returns:
        float: Calculated noise floor threshold
    """
    try:
        if not audio_bytes or len(audio_bytes) < 100:
            return 50.0  # Lower default threshold
            
        linear_pcm = audioop.ulaw2lin(audio_bytes, SAMPLE_WIDTH)
        audio = np.frombuffer(linear_pcm, dtype=np.int16)
        if len(audio) == 0:
            return 50.0  # Lower default threshold
            
        energy = float(np.sqrt(np.mean(audio.astype(np.float32) ** 2)))
        
        # Only calibrate during agent speaking to avoid using user speech as noise
        if not state.is_speaking:
            return state.noise_floor if state.calibration_complete else 50.0
        
        # Collect energy samples for calibration during agent speech
        state.energy_samples.append(energy)
        state.calibration_samples += 1
        
        # Complete calibration after 30 samples (approx 0.6 seconds)
        if state.calibration_samples >= 30 and not state.calibration_complete:
            # Calculate noise floor more conservatively
            if len(state.energy_samples) > 5:
                # Use 75th percentile instead of mean + 2*std to avoid outliers
                state.noise_floor = np.percentile(state.energy_samples, 75)
                # Cap the noise floor to prevent it from being too high
                state.noise_floor = min(state.noise_floor, 200.0)
                # Ensure reasonable minimum threshold
                state.noise_floor = max(state.noise_floor, 30.0)
                state.calibration_complete = True
                logger.info(f"Calibration complete for call {state.call_sid}. Noise floor: {state.noise_floor:.2f}")
            else:
                # Fallback if not enough samples
                state.noise_floor = 50.0
                state.calibration_complete = True
                
        # Return current noise floor or default
        return state.noise_floor if state.calibration_complete else 50.0
        
    except Exception as e:
        logger.error(f"Error in noise floor calibration: {e}")
        return 50.0  # Lower default threshold




async def reset_speaking_state(state: ConversationState):
    await asyncio.sleep(0.5)
    
    # Safety Check: If a new response task is running, DO NOT reset speaking state
    if state.current_response_task and not state.current_response_task.done():
        logger.debug("Skipping speaking state reset - new task active")
        return

    state.is_speaking = False
    logger.info("Speaking state reset - ready to listen for user input")
    
    # Start silence timer
    if state.silence_timer_task:
        state.silence_timer_task.cancel()
    state.silence_timer_task = asyncio.create_task(monitor_silence(state))


async def register_calls(call_sid: str):
    """Helper to register callback with STT service"""
    logger.info(f"🔌 Registering callback for {call_sid}")
    from app.services.stt_service import register_transcript_handler
    
    # Bind the handler with the specific call_sid
    async def bound_handler(text, final, conf):
        await handle_transcript_event(text, final, conf, call_sid)
        
    register_transcript_handler(call_sid, bound_handler)


async def _generate_and_stream_response(state: ConversationState, transcript: str):
    """
    Helper task to generate LLM response and stream TTS.
    Designed to be cancellable.
    """
    try:
        logger.info(f"🤖 Generating Streaming AI Response...")
        
        # --- 1. Lazy Initialization of Autonomous Agent ---
        # If we have a connected agent ID but the object isn't loaded, load it now.
        if not state.autonomous_agent and state.custom_agent_id:
            logger.info(f"🔄 Lazily initializing Autonomous Agent: {state.custom_agent_id}")
            custom_agent = await _fetch_custom_agent(state.custom_agent_id)
            if custom_agent:
                state.autonomous_agent = create_agent(custom_agent)
                state.autonomous_agent.conversation_history = state.conversation_history
                
                # INJECT CAMPAIGN GOAL: Override the generic agent goal with the specific campaign goal
                if state.goal:
                    state.autonomous_agent.config.primary_goal = state.goal
                    logger.info(f"🎯 Overrode agent goal with campaign goal: {state.goal}")
                
                # INJECT CALL SID into context for tools like end_call
                state.autonomous_agent.current_context["call_sid"] = state.call_sid
                state.autonomous_agent.current_context["campaign_id"] = state.campaign_id
                state.autonomous_agent.current_context["lead_id"] = state.lead_id
                state.autonomous_agent.current_context["phone_number"] = state.phone_number
                
                logger.info(f"✅ Agent '{custom_agent.name}' initialized ({len(state.conversation_history)} history items)")
        
        # --- 2. RAG Context Retrieval ---
        # Fetch relevant context if we have a campaign/client ID
        rag_context = ""
        client_id_for_rag = state.campaign_id or state.custom_agent_id
        
        if client_id_for_rag:
            try:
                # Run blocking DB call in thread
                logger.info(f"🔍 Fetching RAG context for ID: {client_id_for_rag}")
                rag_context_list = await asyncio.to_thread(
                    get_relevant_context, 
                    query=transcript, 
                    client_id=client_id_for_rag
                )
                if rag_context_list:
                    rag_context = "\n\n".join(rag_context_list)
                    logger.info(f"📚 RAG Context Found: {len(rag_context)} chars")
            except Exception as e:
                logger.error(f"Error fetching RAG context: {e}")
        
        # --- 2.5. Fetch Lead Purpose for Outbound Calls ---
        lead_purpose = None
        if state.lead_id:
            try:
                from app.database.firestore import db
                lead_doc = db.collection('leads').document(state.lead_id).get()
                if lead_doc.exists:
                    from app.models.lead import Lead
                    lead = Lead.from_dict(lead_doc.to_dict(), lead_doc.id)
                    lead_purpose = lead.purpose
                    if lead_purpose:
                        logger.info(f"📋 Lead Purpose: {lead_purpose}")
                        # Add purpose to RAG context
                        rag_context = f"CALL PURPOSE: {lead_purpose}\n\n{rag_context}"
            except Exception as e:
                logger.error(f"Error fetching lead purpose: {e}")

        # --- 3. Response Generation ---
        sentence_buffer = ""
        full_response_text = ""
        
        # Determine TTS provider with validation
        provider = "cartesia"
        # Removed dynamic provider check as it was removed from CustomAgent model

        
        if state.autonomous_agent:
            # Stream tokens
            async for token in state.autonomous_agent.process_user_input_stream(
                user_text=transcript,
                context=rag_context,
                history=state.conversation_history # Pass ref; agent updates it
            ):
                sentence_buffer += token
                full_response_text += token
                
                # Check for sentence end (naive but fast: . ! ?) followed by space or just end of token if it was punctuation
                # LATENCY OPTIMIZATION: Trigger on commas/semicolons if buffer is long enough to pipeline TTS
                buffer_len = len(sentence_buffer)
                punc_end = any(sentence_buffer.strip().endswith(p) for p in [".", "!", "?"])
                comma_end = any(sentence_buffer.strip().endswith(p) for p in [",", ";", ":"])
                
                # Trigger if:
                # 1. Strong punctuation (.!?) AND moderate length (>20 chars) to avoid "Mr."
                # 2. Weak punctuation (,) AND long length (>150 chars) to break up long sentences
                # 3. Buffer is getting too long (>250 chars) regardless of punctuation
                
                # Trigger if:
                # 1. Strong punctuation (.!?) AND buffer is long enough (>30 chars) to form a coherent clause
                # 2. Very long buffer (>200 chars) as a failsafe
                
                strong_punc = any(sentence_buffer.strip().endswith(p) for p in [".", "!", "?", "。", "\n"])
                
                # LATENCY OPTIMIZATION: Lower thresholds for faster TTS triggering
                should_trigger = (strong_punc and buffer_len > 30) or (buffer_len > 200)
                
                if should_trigger:
                    # Synthesize this chunk STREAMING
                    logger.info(f"🗣️ TTS Chunk: '{sentence_buffer}'")
                    
                    # STREAMING TTS: Yield bytes as they come in
                    from app.services.tts_service import synthesize_speech_stream
                    
                    async for chunk in synthesize_speech_stream(provider, sentence_buffer):
                        if chunk:
                            state.outbound_audio_queue.put_nowait(chunk)
                            if not state.is_speaking:
                                state.is_speaking = True
                    
                    # Clear buffer
                    sentence_buffer = ""

            # Process any remaining text
            if sentence_buffer.strip():
                 logger.info(f"🗣️ TTS Final Chunk: '{sentence_buffer}'")
                 from app.services.tts_service import synthesize_speech_stream
                 
                 async for chunk in synthesize_speech_stream(provider, sentence_buffer):
                     if chunk:
                         state.outbound_audio_queue.put_nowait(chunk)
                         print(f"DEBUG: Queued final chunk {len(chunk)} bytes")
                         state.is_speaking = True
            
            logger.info(f"🤖 Full AI Response: {full_response_text}")
            
            # Reset speaking state after stream completes
            if state.is_speaking:
                asyncio.create_task(reset_speaking_state(state))
            
            # CRITICAL FIX: Add response to history regardless of stream completeness
            # Note: process_user_input_stream adds to history internally, so we SHOULD NOT add it again here for autonomous agents
            # The agent.py logic already appends the full response to state.conversation_history
            pass

        else:
            # Fallback for non-autonomous mode (legacy)
            # IMPORTANT: Pass the fetched rag_context here too!
            ai_text = generate_response(
                transcript=transcript, 
                goal=state.goal or "Assist the user",
                history=state.conversation_history,
                context=rag_context, # Now passing context!
                personality="helpful",
                company_name="our company",
                system_prompt="You are a helpful assistant.",
                agent_name="Assistant"
            )
            if ai_text:
                full_response_text = ai_text
                state.add_message("assistant", ai_text)
                
                # Streaming TTS Fallback
                from app.services.tts_service import synthesize_speech_stream
                
                async for chunk in synthesize_speech_stream(provider, ai_text):
                     if chunk:
                          state.outbound_audio_queue.put_nowait(chunk)
                          if not state.is_speaking:
                               state.is_speaking = True
                
                # Reset speaking state after stream completes
                if state.is_speaking:
                     asyncio.create_task(reset_speaking_state(state))
        
    except asyncio.CancelledError:
        logger.info("🚫 Response generation cancelled")
        raise
    except Exception as e:
        logger.error(f"Error in response generation: {e}", exc_info=True)
        # Attempt fallback TTS
        try:
             # Ensure we save whatever response we generated so far
             if full_response_text:
                 logger.info(f"Saving partial response to history despite error: {full_response_text[:50]}...")
                 state.add_message("assistant", full_response_text)
                 
             error_msg = "I'm having a bit of trouble, please give me a moment."
             from app.services.tts_service import synthesize_speech
             audio = await synthesize_speech(error_msg)
             if audio:
                  state.outbound_audio_queue.put_nowait(audio)
        except:
             pass
    finally:
        state.is_processing = False
        state.current_response_task = None






async def process_audio_chunk(audio_bytes: bytes, call_sid: str) -> Optional[bytes]:
    """
    Non-blocking main loop handler.
    1. Pushes inbound audio to STT stream.
    2. checks outbound queue for TTS audio to send back.
    """
    try:
        # Get or create state
        if call_sid not in active_conversations:
            active_conversations[call_sid] = ConversationState(call_sid)
        
        state = active_conversations[call_sid]

        # Ensure we are listening (Callback Registration)
        # This fixes the issue where greeting-initiated states missed registration
        if hasattr(state, 'is_signal_connected') and not state.is_signal_connected:
            await register_calls(call_sid)
            state.is_signal_connected = True
            logger.info(f"🔌 Signal connected (STT Callback registered) for call {call_sid}")
        elif not hasattr(state, 'is_signal_connected'):
            # Fallback if attribute missing (shouldn't happen with updated class, but safe)
            await register_calls(call_sid)
            state.is_signal_connected = True
            

        
        state = active_conversations[call_sid]
        
        # 1. Stream Audio to STT (Fire & Forget)
        # We assume stt_service.stream_audio_packet is imported and available
        from app.services.stt_service import stream_audio_packet
        # Send raw mulaw audio (Deepgram is configured for it)
        await stream_audio_packet("deepgram", audio_bytes, call_sid)

        # 2. Check Outbound Queue (Non-blocking pop)
        try:
            # Get data if available immediately
            outbound_chunk = state.outbound_audio_queue.get_nowait()
            state.last_audio_time = asyncio.get_event_loop().time()
            return outbound_chunk
        except asyncio.QueueEmpty:
            # Nothing to say essentially
            return None

        except Exception as e:
            logger.error(f"Error in process_audio_chunk: {e}")
            return None

        # Initial greeting - personalized to agent
        if state.needs_greeting and state.first_interaction:
            state.needs_greeting = False
            state.first_interaction = False
            state.is_speaking = True
            
            # Get agent name and company for personalized greeting
            agent_name = "there"
            company_name = "our company"
            agent_goal = state.goal or "assist you"  # Use campaign goal first
            
            if state.autonomous_agent and state.autonomous_agent.config:
                agent_name = state.autonomous_agent.config.name or "there"
                company_name = state.autonomous_agent.config.company_name or "our company"
                # Use campaign goal if available, otherwise use agent's primary goal
                if not state.goal:
                    agent_goal = state.autonomous_agent.config.primary_goal or "assist you"
            
            # Generate natural greeting based on goal type
            greeting = _generate_natural_greeting(agent_name, company_name, agent_goal, state.lead_name)
            
            logger.info(f"Sending personalized greeting: {greeting}")
            try:
                tts_audio = await synthesize_speech_with_provider("cartesia", greeting)
                if tts_audio:
                    state.add_message("assistant", greeting)
                    asyncio.create_task(reset_speaking_state(state))
                    return tts_audio
            except Exception as e:
                logger.error(f"Error generating greeting: {e}")
            finally:
                state.is_speaking = False

        # Barge‑in detection while AI speaking - simplified and more reliable
        if state.is_speaking:
            # Calibrate noise floor dynamically during agent speech
            dynamic_threshold = await calibrate_noise_floor(state, audio_bytes)
            # Use 2x the noise floor for barge-in detection (less aggressive)
            barge_in_threshold = max(dynamic_threshold * 2, 100)
            
            if has_speech_bytes(audio_bytes, threshold=barge_in_threshold):
                state.barge_in_count += 1
                # Require ~0.4s of continuous speech (assuming 20ms chunks -> 20 chunks)
                if state.barge_in_count > 20:
                    logger.info("Barge-In Detected! User interrupted AI.")
                    state.is_speaking = False
                    state.clear_buffer()
                    state.barge_in_count = 0
                    await asyncio.sleep(0.1)
                    state.audio_buffer.extend(audio_bytes)
                    state.last_audio_time = time.time()
                    return "interrupt"  # Return interrupt signal
            else:
                # Decay the counter if silence
                state.barge_in_count = max(0, state.barge_in_count - 1)
                return None

        if state.processing:
            return None

        # Accumulate raw μ‑law from Twilio
        state.audio_buffer.extend(audio_bytes)
        current_time = time.time()
        time_since_last = current_time - state.last_audio_time

        if len(state.audio_buffer) > MAX_BUFFER_SIZE:
            logger.warning("Audio buffer overflow - clearing buffer")
            state.clear_buffer()
            return None

        has_enough = len(state.audio_buffer) >= MIN_AUDIO_LENGTH
        silence = time_since_last >= SILENCE_TIMEOUT and len(state.audio_buffer) > 800
        force_process = len(state.audio_buffer) >= int(MAX_BUFFER_SIZE * 0.9)

        if not has_enough and not silence and not force_process:
            state.last_audio_time = current_time
            return None

        if len(state.audio_buffer) < 800:
            state.last_audio_time = current_time
            return None

        # Basic VAD on raw μ‑law with conservative threshold
        # Use fixed threshold during user speech to avoid blocking legitimate speech
        speech_threshold = 50  # Fixed low threshold for user speech detection
        
        if not has_speech_bytes(state.audio_buffer, threshold=speech_threshold):
            logger.debug("Audio buffer detected as silence/noise; skipping processing")
            state.clear_buffer()
            state.processing = False
            state.last_audio_time = current_time
            return None

        state.processing = True
        state.last_audio_time = current_time

        logger.info(f"Processing audio buffer: {len(state.audio_buffer)} bytes")

        raw_ulaw = bytes(state.audio_buffer)
        
        # Pass raw mu-law audio directly to Deepgram to reduce latency and CPU usage
        # Deepgram is now configured to accept encoding=mulaw sample_rate=8000
        linear_pcm_bytes = raw_ulaw

        if not linear_pcm_bytes:
            state.clear_buffer()
            state.processing = False
            return None

        # ---------------- STT MAIN CALL ----------------
        stt_provider = "deepgram"  # Only supported provider now
        tts_provider = "cartesia"
        llm_provider = "deepseek-v3"

        user_text: Optional[str] = None

        try:
            user_text = await asyncio.wait_for(
                transcribe_audio_with_provider(stt_provider, linear_pcm_bytes, call_sid),
                timeout=STT_TIMEOUT,
            )
        except asyncio.TimeoutError:
            logger.error(f"STT timeout with {stt_provider}")
            # Don't speak error message, just log and return empty
            state.clear_buffer()
            state.processing = False
            return b""

        # If still nothing recognized, optionally reprompt on long silence
        if not user_text:
            state.consecutive_empty_transcripts += 1
            
            # Use varied reprompt messages based on consecutive failure count
            if state.consecutive_empty_transcripts == 1:
                reprompt = "Sorry about that—could be the connection. Let's try again. Could you please speak a bit louder?"
            elif state.consecutive_empty_transcripts == 2:
                reprompt = "I'm still having trouble hearing you. Mind speaking a bit louder or moving to a quieter place?"
            elif state.consecutive_empty_transcripts == 3:
                reprompt = "I'm still having difficulty understanding. Would you like me to connect you to a live agent?"
            elif state.consecutive_empty_transcripts == 4:
                reprompt = "I'm unable to understand your speech. Connecting you to a live agent now."
            else:
                # More varied and empathetic reprompt messages
                reprompts = [
                    "I didn't catch that. Could you please repeat what you said?",
                    "Sorry, I'm having trouble hearing you. Could you speak a bit louder?",
                    "I'm not picking that up clearly. Mind trying again?",
                    "Could you please say that one more time?",
                    "I'm having some difficulty understanding. Would you mind rephrasing?",
                    "Sorry about that—let's try this again. What were you saying?",
                    "I missed that. Can you please speak a little more clearly?"
                ]
                reprompt = random.choice(reprompts)
                
            state.clear_buffer()
            state.processing = False
            tts_audio = await synthesize_speech_with_provider(tts_provider, reprompt)
            if tts_audio:
                state.is_speaking = True
                return tts_audio

            if time_since_last >= SILENCE_TIMEOUT * 2:
                logger.info("Long silence detected, sending reprompt")
                state.clear_buffer()
                state.processing = False
                reprompt = "Hello! Are you still there? How can I help you today?"
                tts_audio = await synthesize_speech_with_provider(tts_provider, reprompt)
                if tts_audio:
                    state.is_speaking = True
                    return tts_audio
            state.clear_buffer()
            state.processing = False
            return None
            
        # Success - reset empty counter
        state.consecutive_empty_transcripts = 0

        print(f"User: {user_text}")
        state.add_message("user", user_text)

        # -------------- AUTONOMOUS AGENT PROCESSING -------------------
        try:
            # Get relevant context if available (synchronous call)
            context = ""
            rag_client_id = state.custom_agent_id or state.campaign_id
            
            if rag_client_id:
                try:
                    # get_relevant_context is synchronous, no await needed
                    # Prioritize agent ID for RAG as memory is likely attached to agent
                    context_list = get_relevant_context(user_text, str(rag_client_id))
                    # Join the list of context strings into a single string
                    if context_list and isinstance(context_list, list):
                        context = "\n".join(context_list)
                        if context:
                            logger.info(f"Retrieved RAG context for client {rag_client_id}: {len(context)} chars")
                        else:
                            logger.info(f"No RAG context found for client {rag_client_id}")
                    else:
                        logger.info(f"No RAG context list returned for client {rag_client_id}")
                        # Try with campaign ID as fallback if we used custom_agent_id
                        if state.custom_agent_id and state.campaign_id:
                            logger.info(f"Trying fallback with campaign ID: {state.campaign_id}")
                            context_list = get_relevant_context(user_text, str(state.campaign_id))
                            if context_list and isinstance(context_list, list):
                                context = "\n".join(context_list)
                                if context:
                                    logger.info(f"Retrieved RAG context with fallback for campaign {state.campaign_id}: {len(context)} chars")
                except Exception as e:
                    logger.error(f"Error getting context for client {rag_client_id}: {e}")
                    logger.error(f"Error details: {str(e)}", exc_info=True)

            # Prepare conversation history
            full_history = state.conversation_history[-MAX_HISTORY_MESSAGES:]

            # Log context being sent to agent
            if context and context.strip():
                logger.info(f"Sending RAG context to agent: {len(context)} chars")
            else:
                logger.info("No RAG context being sent to agent")

            # Use autonomous agent to process input
            logger.info("Processing with autonomous agent")
            try:
                ai_text = await asyncio.wait_for(
                    state.autonomous_agent.process_user_input(
                        user_text=user_text,
                        context=context,
                        history=full_history
                    ),
                    timeout=LLM_TIMEOUT,
                )
            except asyncio.TimeoutError:
                logger.error("Agent processing timeout")
                ai_text = "I apologize, I need a moment. Could you please repeat that?"
            except Exception as e:
                logger.error(f"Agent processing error: {e}")
                # Fallback to direct LLM if agent fails
                ai_text = await asyncio.wait_for(
                    asyncio.to_thread(
                        generate_response,
                        user_text,
                        goal=state.goal or "Answer customer questions",
                        history=full_history,
                        context=context,
                        personality="professional",
                        company_name="our company"
                    ),
                    timeout=LLM_TIMEOUT,
                )

            if not ai_text:
                ai_text = (
                    "I am sorry, I could not understand that. "
                    "Could you please repeat?"
                )

            state.add_message("assistant", ai_text)
            print(f"AI: {ai_text}")
            logger.info(f"AI: {ai_text}")

            tts_audio = await asyncio.wait_for(
                synthesize_speech_with_provider(tts_provider, ai_text),
                timeout=TTS_TIMEOUT,
            )

            state.is_speaking = True
            state.clear_buffer()
            state.processing = False

            if tts_audio:
                asyncio.create_task(reset_speaking_state(state))
                return tts_audio
            else:
                return b""

        except asyncio.TimeoutError:
            logger.error("LLM or TTS timeout")
            state.clear_buffer()
            state.processing = False
            return b""

        except Exception as e:
            logger.error(f"Error in processing: {e}")
            state.clear_buffer()
            state.processing = False
            return b""

    except Exception as e:
        logger.error(f"Error in process_audio_chunk: {e}", exc_info=True)
        # Try to generate an error message for the user
        try:
            # synthesize_speech_with_provider is already imported at top level
            error_msg = "I'm sorry, I encountered an unexpected error. Please try again."
            # Run TTS in a separate task to avoid blocking
            tts_task = asyncio.create_task(synthesize_speech_with_provider("cartesia", error_msg))
            tts_audio = await tts_task
            return tts_audio if tts_audio else b""
        except Exception as tts_error:
            logger.error(f"Error generating error TTS: {tts_error}")
            return b""


def get_conversation_state(
    call_sid: str,
    goal: Optional[str] = None,
    campaign_id: Optional[str] = None,
    phone_number: Optional[str] = None,
    lead_id: Optional[str] = None,
    lead_name: Optional[str] = None,
    custom_agent_id: Optional[str] = None,
) -> "ConversationState":
    """
    Get or create a conversation state for a call.
    """
    if call_sid not in active_conversations:
        active_conversations[call_sid] = ConversationState(
            call_sid, goal, campaign_id, phone_number, lead_id, lead_name, custom_agent_id
        )
    return active_conversations[call_sid]


def get_conversation_state_with_params(call_sid: str, params: dict) -> "ConversationState":
    """
    Get or create a conversation state with parameters from Twilio.
    """
    if call_sid not in active_conversations:
        goal = params.get("goal", "")
        campaign_id = params.get("campaign_id") or None
        phone_number = params.get("phone_number", "")
        lead_id = params.get("lead_id") or None
        lead_name = params.get("lead_name", "Unknown")
        custom_agent_id = params.get("custom_agent_id") or None
        active_conversations[call_sid] = ConversationState(
            call_sid, goal, campaign_id, phone_number, lead_id, lead_name, custom_agent_id
        )
    else:
        # Update existing state with params if provided
        state = active_conversations[call_sid]
        if params.get("goal"):
            state.goal = params.get("goal", "")
        if params.get("campaign_id"):
            state.campaign_id = params.get("campaign_id")
        if params.get("phone_number"):
            state.phone_number = params.get("phone_number", "")
        if params.get("lead_id"):
            state.lead_id = params.get("lead_id")
        if params.get("lead_name"):
            state.lead_name = params.get("lead_name", "Unknown")
        if params.get("custom_agent_id"):
            state.custom_agent_id = params.get("custom_agent_id")
    return active_conversations[call_sid]


def get_all_active_calls() -> List[dict]:
    """
    Get all currently active calls.
    """
    active_calls: List[dict] = []
    for call_sid, state in active_conversations.items():
        active_calls.append(
            {
                "call_sid": call_sid,
                "start_time": state.call_start_time,
                "duration": time.time() - state.call_start_time,
                "last_activity": state.last_audio_time,
                "conversation_turns": len(state.conversation_history),
                "campaign_id": getattr(state, "campaign_id", None),
                "lead_id": getattr(state, "lead_id", None),
                "lead_name": getattr(state, "lead_name", "Unknown"),
                "to_phone": getattr(state, "phone_number", "Unknown"),
                "status": "in_progress",
                "custom_agent_id": getattr(state, "custom_agent_id", None),
            }
        )
    return active_calls


def cleanup_conversation(call_sid: str):
    """
    Clean up a conversation state when call ends.
    """
    print(f"\n{'=' * 60}")
    print(f"Exporting conversation: {call_sid}")
    print(f"{'=' * 60}")

    if call_sid in active_conversations:
        state = active_conversations[call_sid]
        history = memory_store.get_history(call_sid)

        try:
            if history and len(history) > 0:
                transcript = "\n".join(
                    [
                        f"{msg.get('role', 'unknown')}: {msg.get('content', msg.get('text', ''))}"
                        for msg in history
                    ]
                )
                ai_response = next(
                    (
                        msg.get("content", "")
                        for msg in reversed(history)
                        if msg.get("role") == "assistant"
                    ),
                    "",
                )

                conversation = Conversation(
                    campaign_id=str(state.campaign_id) if state.campaign_id else None,
                    lead_id=str(state.lead_id) if state.lead_id else None,
                    transcript=transcript,
                    ai_response=ai_response,
                    duration=int(state.get_call_duration()),
                    status="completed",
                )
                update_time, doc_ref = (
                    firestore_db.collection("conversations")
                    .add(conversation.to_dict())
                )
                conversation.id = doc_ref.id
                print(f"Saved conversation to database with ID: {conversation.id}")

                # Export to CSV
                filename = export_conversation_to_csv(
                    session_id=call_sid,
                    conversation=history,
                    goal=state.goal,
                    client_name=state.lead_name if state.lead_name else "Customer",
                    duration=state.get_call_duration(),
                )
                print(f"EXPORTED: {filename}")
                print(f"   Duration: {state.get_call_duration():.0f}s")
                print(f"   Messages: {len(history)}")
            else:
                print("No history to export")
        except Exception as e:
            print(f"Export error: {e}")

        del active_conversations[call_sid]
        memory_store.clear_history(call_sid)
        print(f"Cleaned up conversation: {call_sid}")
    else:
        print(f"No conversation found for: {call_sid}")


async def trigger_outbound_greeting(call_sid: str):
    """
    Manually trigger the initial greeting for an outbound call.
    This ensures the AI speaks first, even before the user speaks.
    """
    state = active_conversations.get(call_sid)
    if not state:
        logger.warning(f"Cannot trigger greeting: No conversation state for {call_sid}")
        return

    if not state.needs_greeting:
        logger.info(f"Greeting already handling/sent for {call_sid}")
        return

    logger.info(f"📢 Triggering outbound greeting for {call_sid}")
    
    # 1. Determine Agent & Goal context
    agent_name = "there" 
    company_name = "our company"
    agent_goal = state.goal or "assist you"
    voice_id = None  # Default to auto-select

    if state.autonomous_agent and state.autonomous_agent.config:
        agent_name = state.autonomous_agent.config.name or "there"
        company_name = state.autonomous_agent.config.company_name or "our company"
        voice_id = state.autonomous_agent.config.voice_id # Fetch configured voice ID
        
        # If no specific campaign goal, use agent's primary goal
        if not state.goal:
             agent_goal = state.autonomous_agent.config.primary_goal or "assist you"
    
    # 2. Generate Greeting
    greeting = _generate_natural_greeting(
        agent_name, 
        company_name, 
        agent_goal, 
        state.lead_name
    )
    
    # 3. Update State
    state.needs_greeting = False 
    state.first_interaction = False
    state.is_speaking = True
    
    # Add to history so AI knows it said this
    state.add_message("assistant", greeting)
    logger.info(f"🤖 Generated Outbound Greeting: {greeting}")
    
    try:
        # 4. Synthesize & Queue
        # Pass voice_id to ensure consistent voice
        tts_audio = await synthesize_speech_with_provider("cartesia", greeting, voice_id=voice_id)
        if tts_audio:
            logger.info(f"✅ Queued greeting audio ({len(tts_audio)} bytes)")
            state.outbound_audio_queue.put_nowait(tts_audio)
            asyncio.create_task(reset_speaking_state(state))
        else:
            logger.error("❌ TTS returned no audio for greeting")
            state.is_speaking = False
            
    except Exception as e:
        logger.error(f"Failed to synthesize outbound greeting: {e}", exc_info=True)
        state.is_speaking = False