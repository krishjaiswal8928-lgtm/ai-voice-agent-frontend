import asyncio
from app.agent.orchestrator import process_audio_chunk, get_conversation_state

async def test():
    # Create a conversation state
    state = get_conversation_state('test123', goal='Test')
    
    # Process a small audio chunk
    result = await process_audio_chunk(b'\x7f' * 800, 'test123')
    print('First result:', result)
    
    # Process another audio chunk
    result2 = await process_audio_chunk(b'\x7f' * 800, 'test123')
    print('Second result:', result2)

if __name__ == "__main__":
    asyncio.run(test())