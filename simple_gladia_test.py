#!/usr/bin/env python3
"""
Simple Gladia STT test
"""

import asyncio
import os
import sys
import numpy as np

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_gladia_simple():
    print("Testing Gladia STT functionality...")
    
    # Import the STT service
    from app.services.stt_service import _transcribe_with_gladia
    
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
    
    # Test Gladia directly
    print("Testing _transcribe_with_gladia directly...")
    result = await _transcribe_with_gladia(audio_bytes)
    print(f"Result type: {type(result)}")
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test_gladia_simple())