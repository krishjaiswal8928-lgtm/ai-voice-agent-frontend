#!/usr/bin/env python3
"""
Debug Gladia response handling
"""

import json

# Simulate the exact response we're getting
raw_response = [{'transcription': 'E aí', 'language': 'pt', 'confidence': 0.06, 'time_begin': 0.75, 'time_end': 1, 'words': [{'word': 'E', 'time_begin': 0.75, 'time_end': 0.875, 'confidence': 0.05}, {'word': ' aí', 'time_begin': 0.876, 'time_end': 1, 'confidence': 0.07}], 'speaker': 'speaker_not_activated', 'channel': 'channel_0'}]

print("Raw response type:", type(raw_response))
print("Raw response:", raw_response)

# Simulate what happens in the function
result_data = raw_response

# Handle case where result_data might be a string representation of JSON
if isinstance(result_data, str):
    try:
        # Try to parse it as JSON
        result_data = json.loads(result_data)
        print("Parsed string response to JSON:", type(result_data))
    except json.JSONDecodeError:
        print("Failed to parse string response as JSON")
        result_data = None

print("After string check, result_data type:", type(result_data))

# Check if response is a list (multiple segments)
transcript = ""
confidence = 0.0

if isinstance(result_data, list):
    print("Response is a list, processing segments")
    # Extract transcription from each segment and concatenate
    segments = result_data
    transcript_parts = []
    confidences = []
    
    for segment in segments:
        if isinstance(segment, dict):
            if "transcription" in segment:
                transcript_parts.append(str(segment["transcription"]))
                if "confidence" in segment:
                    confidences.append(float(segment["confidence"]))
    
    transcript = " ".join(transcript_parts)
    confidence = sum(confidences) / len(confidences) if confidences else 0.0
    print("Processed list response - transcript:", transcript, "confidence:", confidence)
    
# Convert to string and strip
cleaned = transcript.strip()
print("Final parsed transcript:", cleaned)
print("Final result type:", type(cleaned))