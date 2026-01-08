import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK

def get_firestore_client():
    try:
        # Check if app is already initialized
        if not firebase_admin._apps:
            # Path to service account key or JSON string
            cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
            
            # Check if it's a JSON string or file path
            if cred_path.strip().startswith('{'):
                # It's a JSON string, parse it
                import json
                logger.info("✅ Loading Firebase credentials from environment variable (JSON)")
                cred_dict = json.loads(cred_path)
                cred = credentials.Certificate(cred_dict)
            else:
                # It's a file path
                if not os.path.exists(cred_path):
                    logger.error(f"❌ Firebase credentials file NOT FOUND at {cred_path}")
                    raise FileNotFoundError(f"Firebase credentials file not found at {cred_path}")
                
                logger.info(f"✅ Loading Firebase credentials from {cred_path}")
                cred = credentials.Certificate(cred_path)
            
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin SDK initialized successfully")

        client = firestore.client()
        logger.info("✅ Firestore client created successfully")
        return client
    except Exception as e:
        logger.error(f"❌ Error initializing Firestore: {e}", exc_info=True)
        raise e

class LazyFirestoreClient:
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = get_firestore_client()
        return self._client
        
    def __getattr__(self, name):
        return getattr(self.client, name)

# Global lazy DB client instance
db = LazyFirestoreClient()
logger.info("✅ Global Firestore client configured (lazy loading)")
