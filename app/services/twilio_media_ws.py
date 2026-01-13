import asyncio
import json
import base64
import audioop
import logging
import time
from fastapi import WebSocket
from app.agent.orchestrator import process_audio_chunk, cleanup_conversation
from app.middleware.usage_tracker import check_voice_minutes_before_call, track_voice_minutes

# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)
# --------------------------------------------------------------------------- #

# 20 ms of µ-law silence (all 0xFF = silence in µ-law)
_SILENCE_MULAW_20MS = b"\xff" * 160   # 8 kHz * 0.02 s = 160 samples


async def _send_keepalive(ws: WebSocket, stream_sid: str):
    """Send a tiny silence packet every 15 s to keep Twilio alive."""
    while True:
        await asyncio.sleep(10)  # Reduced to 10 seconds to be safe against 15s timeouts
        try:
            # Check if WebSocket is still connected
            if not hasattr(ws, 'client_state') or ws.client_state.name != "CONNECTED":
                logger.warning("WebSocket not connected, stopping keepalive")
                break
                
            payload = base64.b64encode(_SILENCE_MULAW_20MS).decode()
            message = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": payload
                }
            }
            message_str = json.dumps(message)
            logger.debug(f"Sending keepalive message: {message_str}")
            await ws.send_text(message_str)
            logger.debug("Keep-alive silence sent")
        except asyncio.CancelledError:
            # Task was cancelled, exit gracefully
            logger.debug("Keep-alive task cancelled")
            break
        except Exception as e:
            logger.warning(f"Keep-alive failed: {e}")
            # If we fail to send, it likely means connection is dead. 
            # We break to stop the loop, the main loop will catch the disconnect.
            break


async def _send_tts_chunked(ws: WebSocket, stream_sid: str, tts_pcm16: bytes):
    """
    Convert 16 kHz PCM to 8 kHz µ-law and stream in proper chunks for Twilio.
    """
    try:
        logger.info(f"Sending TTS audio: {len(tts_pcm16)} bytes")
        
        # 16 kHz to 8 kHz PCM
        pcm8k, _ = audioop.ratecv(tts_pcm16, 2, 1, 16000, 8000, None)
        # PCM to µ-law
        mulaw8k = audioop.lin2ulaw(pcm8k, 2)

        # Use safe chunk size for Twilio (3200 bytes as suggested)
        chunk_size = 3200
        chunks_sent = 0
        
        for i in range(0, len(mulaw8k), chunk_size):
            # Check if WebSocket is still open
            if not hasattr(ws, 'client_state') or ws.client_state.name != "CONNECTED":
                logger.warning("WebSocket is not connected, stopping audio stream")
                break
                
            chunk = mulaw8k[i:i + chunk_size]
            payload_b64 = base64.b64encode(chunk).decode("utf-8")
            
            message = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": payload_b64
                }
            }
            
            try:
                # Ensure we're sending a string, not bytes
                message_str = json.dumps(message)
                logger.debug(f"Sending media message: {message_str}")
                await ws.send_text(message_str)
                chunks_sent += 1
                logger.debug(f"Sent media chunk {chunks_sent} with {len(chunk)} bytes")
                await asyncio.sleep(0.010)  # 10 ms delay to match real-time
            except Exception as e:
                logger.error(f"Error sending media chunk {chunks_sent}: {e}")
                # Break on send errors to prevent infinite retries
                break
                
        logger.info(f"Sent {chunks_sent} audio chunks")
        
        # Send a small silence packet at the end to ensure clean ending
        try:
            silence_payload = base64.b64encode(_SILENCE_MULAW_20MS).decode()
            message = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": silence_payload
                }
            }
            message_str = json.dumps(message)
            logger.debug(f"Sending ending silence message: {message_str}")
            await ws.send_text(message_str)
            logger.info("Sent ending silence packet")
        except Exception as e:
            logger.error(f"Error sending ending silence: {e}")
    except Exception as e:
        logger.error(f"Error in _send_tts_chunked: {e}")
        logger.error(f"Error in _send_tts_chunked: {e}")


async def handle_twilio_ws(ws: WebSocket):
    """
    Clean, reliable WebSocket handler.
    """
    stream_sid = None
    call_sid = None
    media_count = 0
    stream_params = {}  # Store stream parameters
    last_activity = time.time()  # Track last activity to detect timeouts
    call_start_time = time.time()  # Track call duration for usage billing
    user_id = None  # Will be extracted from call_sid lookup

    # ------------------------------------------------------------------- #
    try:
        await ws.accept()
        logger.info("WebSocket accepted")
    except Exception as e:
        logger.error(f"WebSocket accept failed: {e}")
        return
    # ------------------------------------------------------------------- #

    # Keep-alive task (starts after we know stream_sid)
    keepalive_task: asyncio.Task | None = None

    try:
        while True:
            # Check for overall timeout
            if time.time() - last_activity > 60:  # 60 second timeout
                logger.warning("WebSocket session timeout - no activity for 60 seconds")
                break
                
            # ------------------- RECEIVE ------------------- #
            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=30.0)
                msg = json.loads(raw)
                event = msg.get("event")
                last_activity = time.time()  # Update last activity
                logger.debug(f"Received WebSocket message: {event}")
            except asyncio.TimeoutError:
                logger.warning("WebSocket timeout – closing")
                break
            except Exception as e:
                # Log the error type specifically
                logger.error(f"WebSocket receive error: {type(e).__name__}: {e}")
                
                # Check for disconnects
                error_str = str(e).lower()
                if "disconnect" in error_str or "closed" in error_str:
                    logger.info("WebSocket disconnected by client, breaking loop")
                    break
                
                # For other errors, we might want to continue, but with a brief pause
                await asyncio.sleep(0.1)
                continue

            # ------------------- START ------------------- #
            if event == "start":
                stream_sid = msg.get("start", {}).get("streamSid")
                call_sid   = msg.get("start", {}).get("callSid")
                
                # Extract stream parameters
                stream_params = msg.get("start", {}).get("customParameters", {})
                if stream_params:
                    logger.info(f"Stream parameters: {stream_params}")
                    # Log individual parameters for debugging
                    campaign_id = stream_params.get('campaign_id')
                    custom_agent_id = stream_params.get('custom_agent_id')
                    phone_number = stream_params.get('phone_number')  # Expect this to be the business 'To' number
                    goal = stream_params.get('goal')
                    logger.info(f"Parsed parameters - Campaign: {campaign_id}, Agent: {custom_agent_id}, Phone: {phone_number}, Goal: {goal}")

                    is_outbound_flag = str(stream_params.get('is_outbound', '')).lower() == 'true'

                    # Re-resolve authoritative mapping from Firestore using the business 'To' number
                    # This is critical because Twilio may not have called the webhook first
                    # SKIP IF OUTBOUND - Trust the params passed from outbound service
                    if not is_outbound_flag:
                        try:
                            from app.database.firestore import db
                            from app.models.campaign import CallSession
                            from app.models.phone_number import VirtualPhoneNumber
                            from google.cloud.firestore_v1.base_query import FieldFilter

                            resolved = {
                                "campaign_id": None,
                                "custom_agent_id": None,
                                "goal": None,
                                "phone_number": phone_number,
                            }

                            logger.info(f"WS: Attempting to resolve mapping using phone_number: {phone_number}")

                            if phone_number:
                                phone_ref = db.collection('virtual_phone_numbers')  # CRITICAL FIX: was 'phone_numbers'
                                # Try exact match
                                phone_docs = list(phone_ref.where(filter=FieldFilter('phone_number', '==', phone_number)).stream())
                                
                                if not phone_docs:
                                    logger.info(f"WS: No exact phone match for '{phone_number}'; listing all phone numbers for debugging")
                                    all_phones = list(phone_ref.limit(10).stream())
                                    for p in all_phones:
                                        pdata = p.to_dict()
                                        logger.info(f"  Available phone: {pdata.get('phone_number')} -> agents: {pdata.get('assigned_agents', [])}")
                                else:
                                    logger.info(f"WS: Found {len(phone_docs)} phone record(s) for {phone_number}")

                            target_agent_id = None
                            if phone_docs:
                                for d in phone_docs:
                                    pn = VirtualPhoneNumber.from_dict(d.to_dict())
                                    if pn.is_active and pn.assigned_agents:
                                        target_agent_id = pn.assigned_agents[0]
                                        logger.info(f"WS: Resolved agent from phone: {target_agent_id}")
                                        break

                            if target_agent_id:
                                call_sessions_ref = db.collection('campaigns')
                                q = call_sessions_ref.where(filter=FieldFilter('type', '==', 'inbound')) \
                                                  .where(filter=FieldFilter('status', '==', 'active')) \
                                                  .where(filter=FieldFilter('custom_agent_id', '==', target_agent_id))
                                found_call_sessions = [CallSession.from_dict(doc.to_dict(), doc.id) for doc in q.stream()]
                                if found_call_sessions:
                                    found_call_sessions.sort(key=lambda c: c.updated_at or c.created_at, reverse=True)
                                    chosen = found_call_sessions[0]
                                    resolved["campaign_id"] = chosen.id
                                    resolved["custom_agent_id"] = chosen.custom_agent_id
                                    resolved["goal"] = chosen.goal or ""
                                    logger.info(f"WS: ✅ Resolved call session {resolved['campaign_id']} for agent {target_agent_id}")
                                    logger.info(f"WS: Goal: {resolved['goal']}")
                                else:
                                    logger.warning(f"WS: ❌ No active inbound call session for agent {target_agent_id}")
                            else:
                                logger.warning(f"WS: ❌ Could not resolve agent from phone number {phone_number}")
                                # Fallback: try to find ANY active inbound call session
                                logger.info("WS: Attempting fallback to any active inbound call session...")
                                call_sessions_ref = db.collection('campaigns')
                                q = call_sessions_ref.where(filter=FieldFilter('type', '==', 'inbound')) \
                                                  .where(filter=FieldFilter('status', '==', 'active'))
                                fallback_call_sessions = [CallSession.from_dict(doc.to_dict(), doc.id) for doc in q.stream()]
                                if fallback_call_sessions:
                                    fallback_call_sessions.sort(key=lambda c: bool(c.custom_agent_id), reverse=True)
                                    chosen = fallback_call_sessions[0]
                                    resolved["campaign_id"] = chosen.id
                                    resolved["custom_agent_id"] = chosen.custom_agent_id
                                    resolved["goal"] = chosen.goal or ""
                                    logger.info(f"WS: Using fallback call session {resolved['campaign_id']}")

                            # If authoritative resolution succeeded, override
                            if resolved["campaign_id"] and resolved["custom_agent_id"]:
                                stream_params.update({
                                    "campaign_id": resolved["campaign_id"],
                                    "custom_agent_id": resolved["custom_agent_id"],
                                    "goal": resolved["goal"],
                                    "phone_number": phone_number,
                                })
                                logger.info("✅ WS parameters OVERRIDDEN using Firestore mapping")
                            else:
                                logger.warning("⚠️ WS: Could not resolve campaign/agent; using provided params (may be incorrect)")

                        except Exception as e:
                            logger.error(f"WS mapping override failed: {e}")
                            import traceback
                            traceback.print_exc()
                    else:
                        logger.info("WS: Outbound call detected - skipping inbound re-resolution and trusting params.")

                    # Log custom agent existence for visibility
                    if stream_params.get('custom_agent_id'):
                        try:
                            from app.database.firestore import db
                            from app.models.custom_agent import CustomAgent
                            doc_ref = db.collection("custom_agents").document(str(stream_params['custom_agent_id']))
                            doc = doc_ref.get()
                            if doc.exists:
                                custom_agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
                                logger.info(f"Custom agent details - Name: {custom_agent.name}, ID: {custom_agent.id}")
                            else:
                                logger.warning(f"No custom agent found with ID: {stream_params['custom_agent_id']}")
                        except Exception as e:
                            logger.error(f"Error fetching custom agent details: {e}")

                logger.info(f"CALL STARTED – SID: {call_sid}")

                # Start keep-alive now that we know stream_sid
                if stream_sid and not keepalive_task:
                    logger.info(f"Starting keep-alive task for stream {stream_sid}")
                    keepalive_task = asyncio.create_task(
                        _send_keepalive(ws, stream_sid)
                    )
                
                # Pass parameters to orchestrator (after override)
                if stream_params and call_sid:
                    from app.agent.orchestrator import get_conversation_state_with_params
                    get_conversation_state_with_params(call_sid, stream_params)

            # ------------------- MEDIA ------------------- #
            elif event == "media":
                # Ensure we have a call_sid
                if not call_sid:
                    call_sid = msg.get("media", {}).get("callSid", "")
                    if not call_sid:
                        logger.warning("No call_sid available for media processing")
                        continue
                        
                media_count += 1
                payload_b64 = msg.get("media", {}).get("payload", "")
                if not payload_b64:
                    continue

                try:
                    # Get raw μ-law bytes directly from Twilio (no conversion)
                    raw_mulaw_bytes = base64.b64decode(payload_b64)

                    # ADD: Log audio chunk info for debugging
                    logger.debug(f"Received audio chunk #{media_count}: {len(raw_mulaw_bytes)} bytes")

                    # Ensure conversation state exists before processing
                    # This handles cases where media arrives before start event is fully processed
                    from app.agent.orchestrator import active_conversations, get_conversation_state_with_params
                    if call_sid not in active_conversations:
                        logger.info(f"Creating conversation state for call {call_sid} (media arrived before start)")
                        # Create a minimal conversation state
                        # Use empty params for now, they'll be updated when start event arrives
                        get_conversation_state_with_params(call_sid, stream_params or {})

                    # AI pipeline - send raw μ-law bytes directly to orchestrator
                    tts_pcm16 = await process_audio_chunk(raw_mulaw_bytes, call_sid)

                    # ========== Barge-In Handle "interrupt" signal ====
                    if tts_pcm16 == "interrupt":
                        logger.info("BARGE-IN: Sending 'clear' to stop AI speech")
                        # Check if WebSocket is still connected before sending
                        if hasattr(ws, 'client_state') and ws.client_state.name == "CONNECTED" and stream_sid:
                            try:
                                message = {
                                    "event": "clear",
                                    "streamSid": stream_sid
                                }
                                message_str = json.dumps(message)
                                logger.debug(f"Sending clear message: {message_str}")
                                await ws.send_text(message_str)
                                logger.info("Sent 'clear' signal for barge-in")
                            except Exception as e:
                                logger.error(f"Error sending clear signal: {e}")
                        # Reset the conversation state to ensure continued listening
                        if call_sid:
                            from app.agent.orchestrator import active_conversations
                            if call_sid in active_conversations:
                                state = active_conversations[call_sid]
                                state.is_speaking = False
                                state.processing = False
                        continue # skip sending any audio

                    # ---- SEND ONLY IF MEANINGFUL ----
                    elif isinstance(tts_pcm16, bytes) and len(tts_pcm16) > 0 and stream_sid:
                        # Check if WebSocket is still connected before sending
                        if hasattr(ws, 'client_state') and ws.client_state.name == "CONNECTED":
                            logger.info(f"Sending AI response audio: {len(tts_pcm16)} bytes")
                            await _send_tts_chunked(ws, stream_sid, tts_pcm16)
                            logger.info("AI response audio sent successfully")
                        else:
                            logger.warning("WebSocket not connected, skipping audio send")
                    # Handle empty but not None response
                    elif isinstance(tts_pcm16, bytes) and len(tts_pcm16) == 0 and stream_sid:
                        logger.warning("Empty audio response received - no audio will be sent")
                        # Don't send any processing message, just continue

                except Exception as e:
                    logger.error(f"Media processing error: {e}")
                    logger.error(f"Media processing error: {e}")
                    import traceback
                    traceback.print_exc()
                    # Send error message to user
                    try:
                        from app.services.tts_service import synthesize_speech_with_provider
                        error_audio = await synthesize_speech_with_provider("cartesia", "I'm sorry, I encountered an error. Please try again.")
                        if not error_audio:  # TRY FALLBACK
                            error_audio = await synthesize_speech_with_provider("openai", "I'm sorry, I encountered an error. Please try again.")
                        if error_audio and stream_sid and hasattr(ws, 'client_state') and ws.client_state.name == "CONNECTED":
                            logger.info(f"Sending error audio: {len(error_audio)} bytes")
                            await _send_tts_chunked(ws, stream_sid, error_audio)
                            logger.info("Error audio sent successfully")
                    except Exception as tts_error:
                        logger.error(f"Error generating error audio: {tts_error}")

            # ------------------- STOP ------------------- #
            elif event == "stop":
                logger.info(f"CALL ENDED – packets: {media_count}")
                print("\n" + "="*60)
                print(f"CALL ENDED – Media packets: {media_count}")
                print("="*60 + "\n")

                if call_sid:
                    cleanup_conversation(call_sid)
                break

    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")
        logger.error(f"Unexpected WebSocket error: {e}")
        import traceback
        traceback.print_exc()
        # Try to send an error message to the user
        try:
            if stream_sid and hasattr(ws, 'client_state') and ws.client_state.name == "CONNECTED":
                from app.services.tts_service import synthesize_speech_with_provider
                error_audio = await synthesize_speech_with_provider("cartesia", "We're sorry, an application error has occurred.")
                if not error_audio:  # TRY FALLBACK
                    error_audio = await synthesize_speech_with_provider("openai", "We're sorry, an application error has occurred.")
                if error_audio:
                    logger.info(f"Sending final error audio: {len(error_audio)} bytes")
                    await _send_tts_chunked(ws, stream_sid, error_audio)
                    logger.info("Final error audio sent successfully")
        except Exception as tts_error:
            logger.error(f"Error generating final error audio: {tts_error}")

    finally:
        # Cancel keep-alive
        if keepalive_task and not keepalive_task.done():
            keepalive_task.cancel()
            try:
                await keepalive_task
            except asyncio.CancelledError:
                pass

        # Close connection gracefully
        try:
            if hasattr(ws, 'client_state') and ws.client_state.name == "CONNECTED":
                await ws.close()
            logger.info("WebSocket closed")
            print("WebSocket closed")
        except Exception as e:
            logger.warning(f"Error closing WebSocket: {e}")
            print(f"Error closing WebSocket: {e}")