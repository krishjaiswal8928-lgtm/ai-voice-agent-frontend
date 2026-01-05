import os
import httpx
import asyncio
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def analyze_deepgram_response():
    """Analyze Deepgram response in detail"""
    DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
    
    if not DEEPGRAM_API_KEY:
        print("❌ DEEPGRAM_API_KEY not found")
        return False
    
    # Create test audio
    sample_rate = 16000
    duration = 2.0
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Create more complex audio with varying frequencies
    audio_data = (
        np.sin(2 * np.pi * 200 * t) * 0.4 +
        np.sin(2 * np.pi * 400 * t) * 0.3 +
        np.sin(2 * np.pi * 800 * t) * 0.2 +
        np.random.normal(0, 0.1, t.shape)
    )
    
    # Apply envelope to simulate speech
    envelope = np.zeros_like(t)
    # Create a speech-like envelope with pauses
    envelope[0:int(0.2*sample_rate)] = np.linspace(0, 1, int(0.2*sample_rate))  # Ramp up
    envelope[int(0.2*sample_rate):int(0.8*sample_rate)] = 1.0  # Steady
    envelope[int(0.8*sample_rate):int(1.0*sample_rate)] = np.linspace(1, 0, int(0.2*sample_rate))  # Ramp down
    envelope[int(1.0*sample_rate):int(1.2*sample_rate)] = 0.0  # Pause
    envelope[int(1.2*sample_rate):int(1.8*sample_rate)] = 1.0  # Second segment
    envelope[int(1.8*sample_rate):int(2.0*sample_rate)] = np.linspace(1, 0, int(0.2*sample_rate))  # Ramp down
    
    audio_data = audio_data * envelope
    audio_data = audio_data * 32767 / np.max(np.abs(audio_data))
    audio_data = audio_data.astype(np.int16)
    audio_bytes = audio_data.tobytes()
    
    print(f"Created audio: {len(audio_bytes)} bytes")
    
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/raw"
    }
    
    # Test with comprehensive parameters
    params = {
        "model": "nova-2-general",
        "encoding": "linear16",
        "sample_rate": "16000",
        "punctuate": "true",
        "smart_format": "true",
        "utterances": "true"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                headers=headers,
                params=params,
                content=audio_bytes
            )
            
            print(f"Response status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("✅ Request successful")
                print(f"Full response keys: {data.keys()}")
                
                # Analyze metadata
                if 'metadata' in data:
                    print(f"Metadata: {data['metadata']}")
                
                # Analyze results structure
                if 'results' in data:
                    results = data['results']
                    print(f"Results keys: {results.keys()}")
                    
                    if 'channels' in results:
                        channels = results['channels']
                        print(f"Channels count: {len(channels)}")
                        if len(channels) > 0:
                            channel = channels[0]
                            print(f"Channel keys: {channel.keys()}")
                            
                            if 'alternatives' in channel:
                                alternatives = channel['alternatives']
                                print(f"Alternatives count: {len(alternatives)}")
                                if len(alternatives) > 0:
                                    alternative = alternatives[0]
                                    print(f"Alternative keys: {alternative.keys()}")
                                    print(f"Transcript: '{alternative.get('transcript', 'NOT FOUND')}'")
                                    print(f"Confidence: {alternative.get('confidence', 'NOT FOUND')}")
                                    
                                    # Check for words
                                    if 'words' in alternative:
                                        words = alternative['words']
                                        print(f"Words count: {len(words)}")
                                        for i, word in enumerate(words[:5]):  # Show first 5
                                            print(f"  Word {i}: {word}")
                                    
                                    # Check for utterances
                                    if 'utterances' in channel:
                                        utterances = channel['utterances']
                                        print(f"Utterances count: {len(utterances)}")
                                        for i, utterance in enumerate(utterances[:3]):  # Show first 3
                                            print(f"  Utterance {i}: {utterance}")
                
                # Pretty print the full response for debugging
                import json
                print("\nFull response:")
                print(json.dumps(data, indent=2))
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Response text: {response.text}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(analyze_deepgram_response())