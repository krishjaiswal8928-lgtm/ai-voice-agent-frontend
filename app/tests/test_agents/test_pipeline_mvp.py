import os
from app.services.stt_service import transcribe_audio
from app.services.llm_service import generate_response
from app.services.tts_service import synthesize_speech

# ----1. Set up environment variables ----
# (Ensure keys are already in my .env)
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# ---2. Test Input ---
AUDIO_FILE = "data/recordings/sample_test.wav"
GOAL  = "collect customer feedback on service satisfaction."

# --3. Step 1: Transcription(STT) --
print("\nStep1 : Running STT...")
transcript = transcribe_audio(AUDIO_FILE)
print(f"📄 Transcript :{transcript}\n")

# --4. Step 2 : LLM Reasoning ----
print("\n Step 2: Generating LLM Response...")
ai_response = generate_response(transcript, GOAL)
print(f"AI Response: {ai_response}")

# -- 5. Step 3: TTS (Convert AI Response to Audio) ---
print("\n Step3: Converting Response to Audio...")
output_path = synthesize_speech(ai_response, "output_test.mp3")
print(f"TTS Audio saved at :{output_path}")

print("\n Pipeline Completed Successfully")
