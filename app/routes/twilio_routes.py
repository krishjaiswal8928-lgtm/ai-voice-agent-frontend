# app/routes/twilio_routes.py
"""
Twilio Voice Routes - Fixed Version
Handles incoming calls and WebSocket connections
"""

from fastapi import APIRouter, Request, Response, WebSocket
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
from app.services.twilio_media_ws import handle_twilio_ws
import os
import logging
from dotenv import load_dotenv
import asyncio

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuration
WEBHOOK_DOMAIN = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
if not WEBHOOK_DOMAIN:
    logger.warning("WEBHOOK_BASE_DOMAIN not set in environment variables")
else:
    # Clean the domain - remove protocol and trailing slashes
    WEBHOOK_DOMAIN = WEBHOOK_DOMAIN.replace("https://", "").replace("http://", "").replace("wss://", "").replace("ws://", "").strip("/")
    # Remove any path segments if present (e.g. if user pasted full webhook URL)
    WEBHOOK_DOMAIN = WEBHOOK_DOMAIN.split('/')[0]
WEBSOCKET_URL = f"wss://{WEBHOOK_DOMAIN}/twilio/ws" if WEBHOOK_DOMAIN else ""
logger.info(f"WEBSOCKET_URL = {WEBSOCKET_URL}")


@router.get("/voice/webhook")
async def voice_webhook_info():
    """GET endpoint for testing webhook URL"""
    return {
        "message": "Twilio Voice Webhook is active!",
        "webhook_url": f"https://{WEBHOOK_DOMAIN}/twilio/voice/webhook",
        "websocket_url": WEBSOCKET_URL,
        "status": "ready"
    }


@router.post("/voice/webhook")
async def voice_webhook(request: Request):
    # Logging for debugging
    print("\nWEBHOOK CALLED — START")  # MUST PRINT
    logger.info("WEBHOOK: Request received")

    try:
        # Add timeout
        form_data = await asyncio.wait_for(request.form(), timeout=5.0)
        call_sid = form_data.get("CallSid", "unknown")
        from_num = form_data.get("From", "unknown")
        to_num = form_data.get("To", "unknown")
        
        # Normalize phone numbers (remove spaces, dashes, etc, keep +)
        def normalize_phone(p):
            if not p: return ""
            return p.replace(" ", "").replace("-", "").replace("(", "").replace(")", "").strip()
        
        from_num_norm = normalize_phone(from_num)
        to_num_norm = normalize_phone(to_num)

        direction = form_data.get("Direction") or form_data.get("CallDirection") or "inbound"
        logger.info(f"Call Direction: {direction}")

        # Check if this is an outbound call by looking at call context or explicit direction
        # Params might be in query string (from outbound_service) or body (Twilio standard)
        campaign_id = form_data.get("campaign_id") or request.query_params.get("campaign_id")
        lead_id = form_data.get("lead_id") or request.query_params.get("lead_id")
        goal = form_data.get("goal") or request.query_params.get("goal") or ""
        rag_document_id = form_data.get("rag_document_id") or request.query_params.get("rag_document_id")
        custom_agent_id = form_data.get("custom_agent_id") or request.query_params.get("custom_agent_id")
        
        from app.database.firestore import db
        if not db:
            logger.error("❌ Firestore DB client is not initialized")
            raise Exception("Database connection failed")

        print(f"Form data: CallSid={call_sid}, From={from_num_norm}, To={to_num_norm}, Direction={direction}")
        print(f"Context: campaign_id={campaign_id}, lead_id={lead_id}, goal={goal}")

        response = VoiceResponse()
        
        # Determine inbound vs outbound using explicit Direction from Twilio
        is_outbound_api = direction == 'outbound-api'
        
        # Legacy fallback if Direction is missing but context is present
        if not is_outbound_api and campaign_id and lead_id:
             logger.info("Assuming Outbound based on campaign_id/lead_id context")
             is_outbound_api = True

        if is_outbound_api:
            # Treat as outbound
            # Get ICP from query params
            ideal_customer_description = form_data.get("ideal_customer_description") or request.query_params.get("ideal_customer_description") or ""
            
            connect = Connect()
            stream = Stream(url=WEBSOCKET_URL)
            stream.parameter(name="campaign_id", value=str(campaign_id))
            stream.parameter(name="lead_id", value=str(lead_id))
            stream.parameter(name="goal", value=goal)
            stream.parameter(name="ideal_customer_description", value=ideal_customer_description)
            stream.parameter(name="rag_document_id", value=rag_document_id or "")
            stream.parameter(name="custom_agent_id", value=custom_agent_id or "")
            stream.parameter(name="call_sid", value=call_sid)
            stream.parameter(name="phone_number", value=to_num_norm)
            # Explicitly flag as outbound to prevent WS from re-resolving as Inbound
            stream.parameter(name="is_outbound", value="true")
            
            connect.append(stream)
            response.append(connect)
        else:
            # Strict inbound routing based on dialed business number
            from app.models.campaign import CallSession
            from app.models.phone_number import VirtualPhoneNumber

            try:
                campaign = None
                target_agent_id = None

                # 1) Resolve assigned agent from business number
                try:
                    if phone_docs:
                        for doc in phone_docs:
                            pn = VirtualPhoneNumber.from_dict(doc.to_dict())
                            if pn.is_active and pn.assigned_agents:
                                target_agent_id = pn.assigned_agents[0]
                                logger.info(f"STRICT ROUTING: Business line {to_num_norm} assigned to agent {target_agent_id}")
                                break
                except Exception as e:
                    logger.warning(f"Error checking phone number assignment: {e}")

                # 2) Find active inbound call session for that agent
                if target_agent_id:
                    call_sessions_ref = db.collection('campaigns')
                    q = call_sessions_ref.where(filter=FieldFilter('type', '==', 'inbound')) \
                                      .where(filter=FieldFilter('status', '==', 'active')) \
                                      .where(filter=FieldFilter('custom_agent_id', '==', target_agent_id))
                    found_call_sessions = [CallSession.from_dict(d.to_dict(), d.id) for d in q.stream()]
                    if found_call_sessions:
                        # Prefer most recently updated
                        found_call_sessions.sort(key=lambda c: c.updated_at or c.created_at, reverse=True)
                        call_session = found_call_sessions[0]
                        logger.info(f"✅ Found inbound call session {call_session.id} for agent {target_agent_id}")
                    else:
                        logger.warning(f"❌ No active inbound call session for agent {target_agent_id}")
                        response.say("The assigned agent is currently unavailable. Please try again later.", voice="Polly.Joanna")
                        response.hangup()
                        return Response(content=str(response), media_type="application/xml")
                else:
                    # 3) Generic pool fallback
                    logger.info("No agent assignment on this number. Checking general inbound call sessions...")
                    call_sessions_ref = db.collection('campaigns')
                    q = call_sessions_ref.where(filter=FieldFilter('type', '==', 'inbound')) \
                                     .where(filter=FieldFilter('status', '==', 'active'))
                    found_call_sessions = [CallSession.from_dict(d.to_dict(), d.id) for d in q.stream()]
                    if found_call_sessions:
                        found_call_sessions.sort(key=lambda c: bool(c.custom_agent_id), reverse=True)
                        call_session = found_call_sessions[0]
                        logger.info(f"Using fallback inbound call session {call_session.id}")

                if call_session:
                    resolved_campaign_id = call_session.id
                    resolved_goal = call_session.goal or ""
                    resolved_icp = call_session.ideal_customer_description or ""
                    resolved_agent_id = call_session.custom_agent_id

                    logger.info(
                        f"Resolved Inbound Context - Campaign: {resolved_campaign_id}, Agent: {resolved_agent_id}, Goal: {resolved_goal}"
                    )

                    # Build TwiML with server-side resolved params
                    connect = Connect()
                    stream = Stream(url=WEBSOCKET_URL)
                    stream.parameter(name="campaign_id", value=str(resolved_campaign_id))
                    stream.parameter(name="goal", value=resolved_goal)
                    stream.parameter(name="ideal_customer_description", value=resolved_icp)
                    stream.parameter(name="call_sid", value=call_sid)
                    # IMPORTANT: pass the business 'To' number so WS can re-validate mapping
                    stream.parameter(name="phone_number", value=to_num_norm)
                    if resolved_agent_id:
                        stream.parameter(name="custom_agent_id", value=str(resolved_agent_id))
                    connect.append(stream)
                    response.append(connect)
                else:
                    logger.warning("No active inbound call sessions found")
                    response.say(
                        "Thank you for calling. Our voice agent system is not currently available. Please try again later.",
                        voice="Polly.Joanna",
                    )
                    response.hangup()
                    return Response(content=str(response), media_type="application/xml")

            except Exception as e:
                logger.error(f"Error querying inbound campaigns: {e}")
                import traceback
                traceback.print_exc()
                response.reject(reason="busy")
                return Response(content=str(response), media_type="application/xml")

        # Normalize Indentation - This runs for both if and else blocks (unless returned earlier)
        xml = str(response)
        print(f"TwiML generated successfully")
        logger.info(f"Returning XML: {xml[:200]}")

        return Response(content=xml, media_type="application/xml")

    except asyncio.TimeoutError:
        error_msg = "TIMEOUT: request.form() took too long"
        print(error_msg)
        logger.error("Timeout processing Twilio webhook request")
        
        # Log timeout error
        
        response = VoiceResponse()
        response.say("Sorry, there was a timeout. Please try again.", voice="Polly.Joanna")
        return Response(content=str(response), media_type="application/xml")
    except Exception as e:
        error_msg = f"EXCEPTION: {e}"
        print(error_msg)
        logger.error(f"Error processing Twilio webhook request: {e}", exc_info=True)
        
        # Detailed error already logged by logger.error above
        
        # Provide a more user-friendly error message
        response = VoiceResponse()
        response.say("We're sorry, an application error has occurred. Please try again later.", voice="Polly.Joanna")
        return Response(content=str(response), media_type="application/xml")

@router.websocket("/ws")
async def twilio_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for Twilio media streams"""
    try:
        await handle_twilio_ws(websocket)
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")


@router.get("/health")
async def twilio_health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Twilio Voice Integration",
        "websocket_url": WEBSOCKET_URL
    }


@router.get("/config")
async def get_twilio_config():
    """Get Twilio configuration"""
    return {
        "webhook_url": f"https://{WEBHOOK_DOMAIN}/twilio/voice/webhook",
        "websocket_url": WEBSOCKET_URL,
        "webhook_domain": WEBHOOK_DOMAIN
    }


@router.post("/status")
async def call_status_callback(request: Request):
    """Handle call status callbacks from Twilio"""
    try:
        form_data = await request.form()
        call_sid = form_data.get("CallSid")
        call_status = form_data.get("CallStatus")
        campaign_id = form_data.get("campaign_id")
        lead_id = form_data.get("lead_id")

        logger.info(f"📊 Call status: {call_sid} - {call_status}")
        
        # Update lead status based on Twilio call status
        if lead_id:
            try:
                from app.database.firestore import db
                from app.models.lead import Lead
                from app.models.conversation import Conversation
                from app.services.lead_caller import lead_caller_service  # Import the lead caller service
                
                try:
                    # Update lead status
                    lead_ref = db.collection('leads').document(str(lead_id))
                    lead_doc = lead_ref.get()
                    
                    if lead_doc.exists:
                        lead = Lead.from_dict(lead_doc.to_dict(), lead_doc.id)
                        
                        # Map Twilio status to our lead status
                        status_mapping = {
                            "queued": "new",
                            "ringing": "in_progress",
                            "in-progress": "in_progress",
                            "completed": "completed",
                            "busy": "failed",
                            "failed": "failed",
                            "no-answer": "failed",
                            "canceled": "failed"
                        }
                        new_status = status_mapping.get(call_status, lead.status)
                        lead_ref.update({"status": new_status})
                        logger.info(f"✅ Updated lead {lead_id} status to {new_status}")
                        
                        # If the call is completed, notify the lead caller service
                        if call_status == "completed":
                            # Run the handle_call_completed in the background
                            import asyncio
                            asyncio.create_task(lead_caller_service.handle_call_completed(str(lead_id), db))
                            logger.info(f"🔔 Notified lead caller service about completion of lead {lead_id}")
                    
                    # Create or update conversation record
                    if call_sid:
                        # Query for existing conversation
                        convs_ref = db.collection('conversations')
                        existing_convs = list(convs_ref.where('lead_id', '==', str(lead_id)).limit(1).stream())
                        
                        if not existing_convs:
                            # Create new conversation
                            conversation = Conversation(
                                lead_id=str(lead_id),
                                campaign_id=str(campaign_id) if campaign_id else None,
                                status=call_status,
                                duration=0,  # Will be updated when call completes
                                transcript=""
                            )
                            convs_ref.add(conversation.to_dict())
                        else:
                            # Update existing conversation
                            conv_doc = existing_convs[0]
                            updates = {"status": call_status}
                            
                            # If call is completed, try to get duration
                            if call_status == "completed":
                                try:
                                    from twilio.rest import Client
                                    import os
                                    client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
                                    call = client.calls(call_sid).fetch()
                                    updates["duration"] = call.duration or 0
                                except Exception as e:
                                    logger.error(f"Error fetching call duration: {e}")
                            
                            conv_doc.reference.update(updates)
                        
                        logger.info(f"✅ Updated conversation for lead {lead_id} with status {call_status}")
                        
                except Exception as e:
                    logger.error(f"Error in Firestore operations: {e}")
                    import traceback
                    traceback.print_exc()
            except Exception as e:
                logger.error(f"Error updating lead/conversation status: {e}")

        return {"status": "received"}

    except Exception as e:
        logger.error(f"❌ Status callback error: {e}")
        return {"status": "error"}