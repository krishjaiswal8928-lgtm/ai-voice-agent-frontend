# app/ui/config.py
import os
from dotenv import load_dotenv

# Load .env from project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

class UIConfig:
    # Twilio
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_NUMBER")
    # API Base URL (for backend communication)
    BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")

    # RAG Settings
    CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE"))
    CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP"))

    # File upload limits
    MAX_FILE_SIZE_MB = 10
    ALLOWED_EXTENSION = {".pdf", ".docx", ".txt"}
    MAX_URLS = 10