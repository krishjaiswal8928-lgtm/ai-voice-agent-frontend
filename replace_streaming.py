"""
Script to replace the simple streaming logic with intelligent tool calling in orchestrator.py
"""

# Read the file
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the start and end lines (0-indexed, so subtract 1)
start_line = 629  # Line 630 in 1-indexed
end_line = 695    # Line 696 in 1-indexed

# New intelligent agent code
new_code = """        if state.autonomous_agent:
            # --- INTELLIGENT AGENT WITH TOOL CALLING ---
            from app.agent.autonomous.executor import AgentExecutor
            
            # Create executor if not exists
            if state.executor is None:
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
            action_result = await state.executor.execute_with_intelligence(
                user_input=transcript,
                context=executor_context
            )
            
            # Handle the action result
            if action_result.success:
                output = action_result.output
                tool_name = action_result.metadata.get("tool") if action_result.metadata else None
                
                if tool_name:
                    logger.info(f"🛠️ Tool executed: {tool_name}")
                    
                    if tool_name == "end_call":
                        logger.info(f"📵 AI ending call - Reason: {output.get('reason')}")
                        final_text = output.get("text", "Thank you for your time. Goodbye!")
                        final_audio = output.get("audio")
                        state.add_message("assistant", final_text)
                        if final_audio:
                            state.outbound_audio_queue.put_nowait(final_audio)
                            state.is_speaking = True
                        state.conversation_ended = True
                        if state.is_speaking:
                            asyncio.create_task(reset_speaking_state(state))
                    
                    elif tool_name == "schedule_callback":
                        logger.info(f"📞 AI scheduled callback - Delay: {action_result.metadata.get('delay_minutes')} min")
                        confirmation_text = output.get("text", "I'll call you back soon.")
                        confirmation_audio = output.get("audio")
                        state.add_message("assistant", confirmation_text)
                        if confirmation_audio:
                            state.outbound_audio_queue.put_nowait(confirmation_audio)
                            state.is_speaking = True
                        state.conversation_ended = True
                        if state.is_speaking:
                            asyncio.create_task(reset_speaking_state(state))
                    
                    elif tool_name == "transfer_to_human":
                        logger.info(f"👤 AI transferring to human - Urgency: {output.get('urgency')}")
                        transfer_text = output.get("text", "Let me connect you with a specialist.")
                        transfer_audio = output.get("audio")
                        state.add_message("assistant", transfer_text)
                        if transfer_audio:
                            state.outbound_audio_queue.put_nowait(transfer_audio)
                            state.is_speaking = True
                        state.conversation_ended = True
                        if state.is_speaking:
                            asyncio.create_task(reset_speaking_state(state))
                    
                    elif tool_name == "continue_conversation":
                        response_text = output.get("text", "I understand.")
                        response_audio = output.get("audio")
                        state.add_message("assistant", response_text)
                        if response_audio:
                            state.outbound_audio_queue.put_nowait(response_audio)
                            state.is_speaking = True
                        if state.is_speaking:
                            asyncio.create_task(reset_speaking_state(state))
                
                else:
                    # Regular text response (no tool)
                    response_text = output.get("text", "")
                    response_audio = output.get("audio")
                    if response_text:
                        state.add_message("assistant", response_text)
                        if response_audio:
                            state.outbound_audio_queue.put_nowait(response_audio)
                            state.is_speaking = True
                        if state.is_speaking:
                            asyncio.create_task(reset_speaking_state(state))
            
            else:
                # Action failed
                logger.error(f"Action execution failed: {action_result.error}")
                fallback_text = "I apologize, I'm having trouble processing that."
                state.add_message("assistant", fallback_text)
                from app.services.tts_service import synthesize_speech_with_provider
                fallback_audio = await synthesize_speech_with_provider(provider, fallback_text)
                if fallback_audio:
                    state.outbound_audio_queue.put_nowait(fallback_audio)
                    state.is_speaking = True
                if state.is_speaking:
                    asyncio.create_task(reset_speaking_state(state))
"""

# Replace the lines
new_lines = lines[:start_line] + [new_code + "\n"] + lines[end_line + 1:]

# Write back
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Successfully replaced simple streaming with intelligent tool calling!")
print(f"Replaced lines {start_line + 1} to {end_line + 1}")
