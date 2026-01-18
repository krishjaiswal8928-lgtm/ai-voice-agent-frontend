"""
Add conversation_ended check to process_audio_chunk
"""

# Read the file
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find line 862 (0-indexed = 861)
insert_after_line = 862  # After "state = active_conversations[call_sid]"

# New code to insert
new_code = """        
        # CHECK IF CONVERSATION ENDED BY AI TOOL
        if hasattr(state, 'conversation_ended') and state.conversation_ended:
            logger.info("🔴 Conversation ended by AI tool - stopping audio processing")
            return None
"""

# Insert the new code
lines.insert(insert_after_line, new_code)

# Write back
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Successfully added conversation_ended check!")
print(f"Inserted after line {insert_after_line + 1}")
