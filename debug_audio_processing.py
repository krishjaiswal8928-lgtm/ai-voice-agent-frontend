import asyncio
import logging
from app.agent.orchestrator import process_audio_chunk, active_conversations, get_conversation_state_with_params

# Set up logging to see detailed output
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_audio_processing():
    """Test the audio processing pipeline"""
    print("Testing audio processing pipeline...")
    
    # Create a conversation state first
    state = get_conversation_state_with_params(
        call_sid="AUDIO_TEST_CALL_123",
        params={
            "campaign_id": "NnNVRlyGutorgtii7Yru",
            "custom_agent_id": "SPH5LutOqgiGQDEndx9x",
            "goal": "Try to sell our Marketing Services.",
            "phone_number": "+16692313371"
        }
    )
    print(f"✅ Created conversation state for call: {state.call_sid}")
    
    # Test with empty audio bytes (this should be handled gracefully)
    print("\nTesting with empty audio bytes...")
    try:
        result = await process_audio_chunk(b"", "AUDIO_TEST_CALL_123")
        print(f"✅ Processed empty audio: {result}")
    except Exception as e:
        print(f"❌ Error processing empty audio: {e}")
        import traceback
        traceback.print_exc()
    
    # Test with some dummy audio bytes
    print("\nTesting with dummy audio bytes...")
    # Create some dummy μ-law audio data (silence)
    dummy_audio = b"\xff" * 160  # 20ms of silence in μ-law
    
    try:
        result = await process_audio_chunk(dummy_audio, "AUDIO_TEST_CALL_123")
        print(f"✅ Processed dummy audio: {result}")
    except Exception as e:
        print(f"❌ Error processing dummy audio: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Audio processing tests completed")

if __name__ == "__main__":
    asyncio.run(test_audio_processing())