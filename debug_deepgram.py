import os
import httpx
import asyncio
import audioop
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_deepgram_detailed():
    """Detailed test of Deepgram API with various audio formats"""
    DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
    
    if not DEEPGRAM_API_KEY:
        print("❌ DEEPGRAM_API_KEY not found")
        return False
    
    print(f"Using API key: {DEEPGRAM_API_KEY[:10]}...{DEEPGRAM_API_KEY[-5:]}")
    
    # Test 1: Create actual speech-like audio (not just silence)
    print("\n=== Test 1: Creating realistic speech audio ===")
    
    # Create 1 second of 16kHz sine wave at 440Hz (A4 note) - should be detectable
    sample_rate = 16000
    duration = 1.0  # 1 second
    frequency = 440  # A4 note
    
    # Generate sine wave
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = np.sin(2 * np.pi * frequency * t)
    
    # Add some noise to make it more speech-like
    noise = np.random.normal(0, 0.1, audio_data.shape)
    audio_data = audio_data + noise
    
    # Normalize and convert to 16-bit integers
    audio_data = audio_data * 32767 / np.max(np.abs(audio_data))
    audio_data = audio_data.astype(np.int16)
    
    # Convert to bytes
    audio_bytes = audio_data.tobytes()
    print(f"Generated audio: {len(audio_bytes)} bytes at {sample_rate}Hz")
    
    # Test 2: Send to Deepgram with minimal parameters
    print("\n=== Test 2: Minimal Deepgram parameters ===")
    
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/raw"
    }
    
    # Minimal parameters first
    params = {
        "model": "nova-2-general",
        "encoding": "linear16",
        "sample_rate": "16000"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                headers=headers,
                params=params,
                content=audio_bytes
            )
            
            print(f"Minimal params response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Minimal params request successful")
                print(f"Full response: {data}")
                
                transcript = (
                    data.get("results", {})
                    .get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                    .get("transcript", "")
                )
                
                print(f"Transcript: '{transcript}'")
            else:
                print(f"❌ Minimal params failed: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error with minimal params: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Try with more parameters
    print("\n=== Test 3: Full Deepgram parameters ===")
    
    params_full = {
        "model": "nova-2-general",
        "language": "en-US",
        "punctuate": "true",
        "encoding": "linear16",
        "sample_rate": "16000",
        "channels": "1"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                headers=headers,
                params=params_full,
                content=audio_bytes
            )
            
            print(f"Full params response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Full params request successful")
                print(f"Full response: {data}")
                
                transcript = (
                    data.get("results", {})
                    .get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                    .get("transcript", "")
                )
                
                print(f"Transcript: '{transcript}'")
            else:
                print(f"❌ Full params failed: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error with full params: {e}")
        import traceback
        traceback.print_exc()

    # Test 4: Try with actual speech recording if available
    print("\n=== Test 4: Checking for sample audio files ===")
    
    # Look for any audio files in the data directory
    import glob
    audio_files = glob.glob("data/**/*.wav", recursive=True)
    if audio_files:
        print(f"Found audio files: {audio_files}")
        # Try the first one
        try:
            with open(audio_files[0], 'rb') as f:
                file_data = f.read()
                print(f"Loaded {len(file_data)} bytes from {audio_files[0]}")
                
                # Try to send this to Deepgram
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.deepgram.com/v1/listen",
                        headers=headers,
                        params={"model": "nova-2-general"},
                        content=file_data
                    )
                    
                    print(f"File test response status: {response.status_code}")
                    if response.status_code == 200:
                        data = response.json()
                        print("✅ File test successful")
                        transcript = (
                            data.get("results", {})
                            .get("channels", [{}])[0]
                            .get("alternatives", [{}])[0]
                            .get("transcript", "")
                        )
                        print(f"Transcript: '{transcript}'")
        except Exception as e:
            print(f"❌ Error with file test: {e}")
    else:
        print("No audio files found in data directory")

if __name__ == "__main__":
    print("Running detailed Deepgram debugging...")
    asyncio.run(test_deepgram_detailed())