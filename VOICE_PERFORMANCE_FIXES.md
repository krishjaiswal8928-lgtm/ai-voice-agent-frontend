# Voice Performance Fixes

## Issues Identified

1. **Slow Response Times (>10 seconds)**: The voice agent was taking too long to respond to user input
2. **Stopped Listening After First Response**: The agent would respond to the first user input but then stop listening for subsequent inputs

## Root Causes

1. **Overly Conservative Settings**: 
   - Large buffer sizes and long silence timeouts were causing delays
   - High timeout values for STT, LLM, and TTS services
   - Neural TTS engine was slower than standard engine

2. **State Management Issues**:
   - After generating a response, the agent wasn't properly resetting to listening state
   - The [is_speaking](file:///C:/voice-agent-theme-update-app/app/agent/orchestrator.py#L58-L58) flag wasn't being reset properly after TTS completion

## Fixes Implemented

### 1. Optimized Buffer and Timing Settings (orchestrator.py)

```python
# Reduced buffer and timing thresholds for faster response
MIN_AUDIO_LENGTH = 800      # From 2000 (400-500ms vs 800-1000ms at 8kHz)
SILENCE_TIMEOUT = 1.0       # From 1.5 seconds
POST_TTS_DELAY = 0.1        # From 0.2 seconds
MAX_BUFFER_SIZE = 160000    # From 320000
```

### 2. Reduced Timeout Values

```python
# Reduced all timeout values for faster failure/recovery
STT_TIMEOUT = 5.0           # From 10.0 seconds
LLM_TIMEOUT = 8.0           # From 15.0 seconds
TTS_TIMEOUT = 5.0           # From 10.0 seconds
```

### 3. Improved Streaming and Token Handling

```python
# Start streaming TTS earlier
STREAMING_MIN_TOKENS = 3    # From 5 tokens
```

### 4. Optimized Deepgram STT Settings (stt_service.py)

```python
# Disabled features that slow down response
"endpointing": "150",           # From 300 for faster phrase detection
"interim_results": "false",     # Disabled for faster response
"utterance_end_ms": "500",      # From 1000 for faster phrase completion
"dictation": "false"            # Disabled for faster response
```

### 5. Reduced LLM Token Generation (llm_service.py)

```python
# Reduced max tokens for faster responses
max_tokens=100                  # From 150
```

### 6. Switched to Standard TTS Engine (tts_service.py)

```python
# Using faster standard engine instead of neural
Engine='standard'               # From 'neural'
```

### 7. Fixed State Management (orchestrator.py)

Added a new `reset_listening_state()` function that properly resets the agent's listening state after TTS completion:

```python
async def reset_listening_state(state):
    """Reset the listening state after a short delay to ensure we continue listening"""
    await asyncio.sleep(0.5)  # Short delay to ensure TTS has finished
    state.is_speaking = False
    state.processing = False
    state.last_audio_time = time.time()  # Reset last audio time
    logger.info("Listening state reset - ready to listen for next user input")
```

### 8. Enhanced Twilio WebSocket Handler (twilio_media_ws.py)

Added explicit state reset for barge-in scenarios to ensure continued listening:

```python
# Reset the conversation state to ensure continued listening
if call_sid:
    from app.agent.orchestrator import _active_conversations
    if call_sid in _active_conversations:
        state = _active_conversations[call_sid]
        state.is_speaking = False
        state.processing = False
```

## Expected Improvements

1. **Response Time**: Should be reduced to under 5 seconds for most interactions
2. **Continuous Listening**: Agent will properly reset to listening state after each response
3. **Barge-in Support**: Better handling of user interruptions
4. **Resource Efficiency**: Smaller buffers and shorter timeouts reduce memory usage

## Testing

Run the test script to verify improvements:
```bash
python test_voice_performance.py
```

The test should show processing times under 5 seconds and proper state management.