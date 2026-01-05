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
            # Path to service account key
            cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")

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

# Global DB client instance
try:
    db = get_firestore_client()
    logger.info("✅ Global Firestore client initialized")
except Exception as e:
    logger.error(f"❌ Failed to initialize global Firestore client: {e}")
    db = None
