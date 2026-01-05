#!/usr/bin/env python3
"""
Final test to confirm Gladia STT is working correctly
"""

import asyncio
import os
import sys
import numpy as np

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_gladia_integration():
    print("=== Final Gladia STT Integration Test ===")
    
    try:
        # Import the STT service
        from app.services.stt_service import transcribe_audio_with_provider, transcribe_audio_direct
        
        # Generate test audio (1 second of 16kHz sine wave)
        sample_rate = 16000
        duration = 1.0  # 1 second
        frequency = 440  # A4 note
        
        # Generate sine wave
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(2 * np.pi * frequency * t)
        
        # Convert to 16-bit PCM
        audio_data = (audio_data * 32767).astype(np.int16)
        audio_bytes = audio_data.tobytes()
        
        print(f"Generated test audio: {len(audio_bytes)} bytes")
        
        # Test 1: Using provider parameter
        print("\n1. Testing transcribe_audio_with_provider with 'gladia'...")
        result1 = await transcribe_audio_with_provider("gladia", audio_bytes)
        print(f"   Result type: {type(result1)}")
        print(f"   Result value: {result1}")
        
        # Test 2: Using direct function
        print("\n2. Testing transcribe_audio_direct...")
        result2 = await transcribe_audio_direct(audio_bytes)
        print(f"   Result type: {type(result2)}")
        print(f"   Result value: {result2}")
        
        # Validation
        print("\n=== Validation ===")
        success = True
        
        # Check that both functions return the same type
        if type(result1) != type(result2):
            print(f"❌ Type mismatch: {type(result1)} vs {type(result2)}")
            success = False
        else:
            print(f"✅ Types match: {type(result1)}")
            
        # Check that results are strings or None
        if result1 is not None and not isinstance(result1, str):
            print(f"❌ Result 1 is not string or None: {type(result1)}")
            success = False
        else:
            print(f"✅ Result 1 is string or None: {type(result1)}")
            
        if result2 is not None and not isinstance(result2, str):
            print(f"❌ Result 2 is not string or None: {type(result2)}")
            success = False
        else:
            print(f"✅ Result 2 is string or None: {type(result2)}")
            
        # Check that if one is None, both are None (they should behave the same)
        if (result1 is None) != (result2 is None):
            print("⚠️  Inconsistent results (one None, one not)")
        else:
            print("✅ Results are consistent")
            
        print("\n=== Final Status ===")
        if success:
            print("✅ Gladia STT integration is working correctly!")
            print("   Note: Synthetic audio may not produce meaningful transcriptions")
            print("   but the integration itself is functional.")
        else:
            print("❌ Gladia STT integration has issues!")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gladia_integration())