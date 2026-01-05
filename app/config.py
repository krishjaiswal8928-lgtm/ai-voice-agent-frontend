import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Database settings
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_voice_agent.db")
    
    # JWT settings
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # Twilio settings
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_NUMBER = os.getenv("TWILIO_NUMBER")
    
    # AI settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
    
    # AWS settings
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    
    # RAG settings
    RAG_CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", 1000))
    RAG_CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", 200))
    
    # Vector store settings
    VECTOR_STORE_PROVIDER = os.getenv("VECTOR_STORE_PROVIDER", "faiss")
    FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "data/faiss_index.bin")
    
    # Celery settings
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

settings = Settings()