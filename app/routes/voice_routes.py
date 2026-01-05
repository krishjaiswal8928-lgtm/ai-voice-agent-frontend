"""
Voice Routes
Twilio webhook and WebSocket endpoints for voice interactions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, WebSocket
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json
from app.dependencies import get_db
from app.services.twilio_service import handle_incoming_call, handle_call_status
from app.agent.orchestrator import process_audio_chunk, get_conversation_state, get_all_active_calls
from app.core.security import get_current_user

router = APIRouter(prefix="/voice", tags=["Voice"])

@router.post("/incoming")
async def incoming_call(request: Request):
    """Handle incoming calls from Twilio"""
    try:
        form_data = await request.form()
        return handle_incoming_call(form_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error handling incoming call: {str(e)}"
        )

@router.post("/status")
async def call_status(request: Request):
    """Handle call status updates from Twilio"""
    try:
        form_data = await request.form()
        return handle_call_status(form_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error handling call status: {str(e)}"
        )

@router.get("/active-calls")
async def get_active_calls():
    """Get all currently active calls"""
    try:
        active_calls = get_all_active_calls()
        return active_calls
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting active calls: {str(e)}"
        )

@router.websocket("/media/{call_sid}")
async def media_stream(websocket: WebSocket, call_sid: str):
    """Handle real-time media streaming from Twilio"""
    await websocket.accept()
    
    try:
        # Process incoming media stream
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["event"] == "media":
                # Process audio chunk
                audio_bytes = message["media"]["payload"]
                response = await process_audio_chunk(audio_bytes, call_sid)
                
                if response:
                    # Send response back through WebSocket
                    await websocket.send_bytes(response)
                    
            elif message["event"] == "start":
                # Initialize conversation state
                get_conversation_state(call_sid)
                
            elif message["event"] == "stop":
                # Clean up conversation
                from app.agent.orchestrator import cleanup_conversation
                cleanup_conversation(call_sid)
                break
                
    except Exception as e:
        print(f"Error in media stream: {e}")
    finally:
        await websocket.close()