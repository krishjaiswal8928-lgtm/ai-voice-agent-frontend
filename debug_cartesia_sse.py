"""
Debug script to investigate Cartesia SSE streaming
"""
import os
from dotenv import load_dotenv
import base64

load_dotenv()

CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY")
MODEL_ID = "sonic-3"
VOICE_ID = "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"  # Tessa

print("="*60)
print("Cartesia SSE Investigation")
print("="*60)

try:
    from cartesia import Cartesia
    
    client = Cartesia(api_key=CARTESIA_API_KEY)
    print("✅ Client initialized")
    
    # Test 1: SSE with raw container
    print("\n🧪 Test 1: SSE with raw container")
    output = client.tts.sse(
        model_id=MODEL_ID,
        transcript="Hello, this is a streaming test.",
        voice={
            "mode": "id",
            "id": VOICE_ID
        },
        output_format={
            "container": "raw",
            "encoding": "pcm_s16le",
            "sample_rate": 16000
        }
    )
    
    chunks = []
    for i, chunk in enumerate(output):
        chunks.append(chunk)
        print(f"  Chunk {i+1}: type={type(chunk).__name__}")
        print(f"    Attributes: {[attr for attr in dir(chunk) if not attr.startswith('_')]}")
        
        if hasattr(chunk, 'audio'):
            print(f"    Has 'audio' attribute: {type(chunk.audio)}")
            if chunk.audio:
                print(f"    Audio length: {len(chunk.audio) if isinstance(chunk.audio, (str, bytes)) else 'N/A'}")
                # Try to decode
                if isinstance(chunk.audio, str):
                    try:
                        decoded = base64.b64decode(chunk.audio)
                        print(f"    ✅ Base64 decoded: {len(decoded)} bytes")
                    except:
                        print(f"    ❌ Failed to decode base64")
            else:
                print(f"    ⚠️  Audio attribute is empty/None")
        
        if hasattr(chunk, 'data'):
            print(f"    Has 'data' attribute: {chunk.data}")
            
        if i >= 2:  # Only check first 3 chunks
            print(f"  ... (stopping after 3 chunks)")
            break
    
    print(f"\n📊 Total chunks received: {len(chunks)}")
    
    # Test 2: bytes API for comparison
    print("\n🧪 Test 2: bytes API (for comparison)")
    output = client.tts.bytes(
        model_id=MODEL_ID,
        transcript="Hello, this is a bytes test.",
        voice={
            "mode": "id",
            "id": VOICE_ID
        },
        output_format={
            "container": "wav",
            "encoding": "pcm_s16le",
            "sample_rate": 16000
        }
    )
    
    total_bytes = 0
    chunk_count = 0
    for chunk in output:
        total_bytes += len(chunk)
        chunk_count += 1
    
    print(f"  ✅ Bytes API: {chunk_count} chunks, {total_bytes:,} total bytes")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
