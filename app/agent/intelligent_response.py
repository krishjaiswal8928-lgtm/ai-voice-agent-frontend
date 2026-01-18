# INTELLIGENT AGENT IMPLEMENTATION
# This file contains the new intelligent response generation code
# To be integrated into orchestrator.py at line 626

async def _generate_intelligent_response(state: ConversationState, transcript: str, rag_context: str, provider: str):
    """
    Generate intelligent response with tool calling support.
    Replaces the simple streaming method.
    """
    from app.agent.autonomous.executor import AgentExecutor
    
    # Create executor if not exists
    if not hasattr(state, 'executor') or state.executor is None:
        state.executor = AgentExecutor(state.autonomous_agent.config)
        logger.info("✅ Created AgentExecutor for intelligent tool calling")
    
    # Build context for executor
    executor_context = {
        "goal": state.goal or "",
        "rag_context": rag_context,
        "history": state.conversation_history,
        "call_sid": state.call_sid,
        "campaign_id": state.campaign_id,
        "lead_id": state.lead_id,
        "phone_number": state.phone_number,
        "lead_name": state.lead_name,
        "agent_name": state.autonomous_agent.config.name if state.autonomous_agent.config else "Assistant"
    }
    
    # Execute with intelligence (supports tools)
    try:
        action_result = await state.executor.execute_with_intelligence(
            user_input=transcript,
            context=executor_context
        )
        
        # Handle the result
        if action_result.success:
            output = action_result.output
            
            # Check if this is a tool call
            tool_name = action_result.metadata.get("tool") if action_result.metadata else None
            
            if tool_name:
                logger.info(f"🛠️ Tool executed: {tool_name}")
                
                # Handle specific tools
                if tool_name == "end_call":
                    # End call tool was executed
                    logger.info(f"📵 AI decided to end call - Reason: {output.get('reason')}")
                    
                    # Get the final message and audio
                    final_text = output.get("text", "Thank you for your time. Goodbye!")
                    final_audio = output.get("audio")
                    
                    # Add to history
                    state.add_message("assistant", final_text)
                    
                    # Queue audio
                    if final_audio:
                        state.outbound_audio_queue.put_nowait(final_audio)
                        state.is_speaking = True
                    
                    # Set flag to end conversation
                    state.conversation_ended = True
                    
                    # Reset speaking state after audio plays
                    if state.is_speaking:
                        asyncio.create_task(reset_speaking_state(state))
                
                elif tool_name == "schedule_callback":
                    # Callback scheduled
                    logger.info(f"📞 AI scheduled callback - Delay: {action_result.metadata.get('delay_minutes')} min")
                    
                    # Get confirmation message and audio
                    confirmation_text = output.get("text", "I'll call you back soon.")
                    confirmation_audio = output.get("audio")
                    
                    # Add to history
                    state.add_message("assistant", confirmation_text)
                    
                    # Queue audio
                    if confirmation_audio:
                        state.outbound_audio_queue.put_nowait(confirmation_audio)
                        state.is_speaking = True
                    
                    # End conversation after scheduling callback
                    state.conversation_ended = True
                    
                    # Reset speaking state
                    if state.is_speaking:
                        asyncio.create_task(reset_speaking_state(state))
                
                elif tool_name == "transfer_to_human":
                    # Transfer to human
                    logger.info(f"👤 AI transferring to human - Urgency: {output.get('urgency')}")
                    
                    # Get transfer message and audio
                    transfer_text = output.get("text", "Let me connect you with a specialist.")
                    transfer_audio = output.get("audio")
                    
                    # Add to history
                    state.add_message("assistant", transfer_text)
                    
                    # Queue audio
                    if transfer_audio:
                        state.outbound_audio_queue.put_nowait(transfer_audio)
                        state.is_speaking = True
                    
                    # End conversation (transfer will happen separately)
                    state.conversation_ended = True
                    
                    # Reset speaking state
                    if state.is_speaking:
                        asyncio.create_task(reset_speaking_state(state))
                
                elif tool_name == "continue_conversation":
                    # Continue conversation normally
                    response_text = output.get("text", "I understand.")
                    response_audio = output.get("audio")
                    
                    # Add to history
                    state.add_message("assistant", response_text)
                    
                    # Queue audio
                    if response_audio:
                        state.outbound_audio_queue.put_nowait(response_audio)
                        state.is_speaking = True
                    
                    # Reset speaking state
                    if state.is_speaking:
                        asyncio.create_task(reset_speaking_state(state))
            
            else:
                # Regular text response (no tool)
                response_text = output.get("text", "")
                response_audio = output.get("audio")
                
                if response_text:
                    # Add to history
                    state.add_message("assistant", response_text)
                    
                    # Queue audio
                    if response_audio:
                        state.outbound_audio_queue.put_nowait(response_audio)
                        state.is_speaking = True
                    
                    # Reset speaking state
                    if state.is_speaking:
                        asyncio.create_task(reset_speaking_state(state))
        
        else:
            # Action failed, use fallback
            logger.error(f"Action execution failed: {action_result.error}")
            fallback_text = "I apologize, I'm having trouble processing that."
            state.add_message("assistant", fallback_text)
            
            # Generate fallback audio
            from app.services.tts_service import synthesize_speech_with_provider
            fallback_audio = await synthesize_speech_with_provider(provider, fallback_text)
            if fallback_audio:
                state.outbound_audio_queue.put_nowait(fallback_audio)
                state.is_speaking = True
            
            if state.is_speaking:
                asyncio.create_task(reset_speaking_state(state))
    
    except Exception as e:
        logger.error(f"Intelligent execution failed: {e}", exc_info=True)
        # Fallback to simple response
        fallback_text = "I'm having trouble understanding. Could you repeat that?"
        state.add_message("assistant", fallback_text)
        
        from app.services.tts_service import synthesize_speech_with_provider
        fallback_audio = await synthesize_speech_with_provider(provider, fallback_text)
        if fallback_audio:
            state.outbound_audio_queue.put_nowait(fallback_audio)
            state.is_speaking = True
        
        if state.is_speaking:
            asyncio.create_task(reset_speaking_state(state))
