import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def reset_database():
    """Reset all data in the Firestore database"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    # Collections to clear (in order of dependencies)
    collections = [
        'conversations',
        'leads', 
        'phone_numbers',
        'rag_documents',
        'custom_agents',
        'campaigns',
        'users'
    ]
    
    print("WARNING: This will delete ALL data from the database!")
    print("Collections to be cleared:", collections)
    
    # Confirm before proceeding (auto-confirm for automation)
    print("Auto-confirming reset for automation purposes...")
    confirm = 'YES'
    
    if confirm != 'YES':
        print("Database reset cancelled.")
        return
    
    try:
        for collection_name in collections:
            print(f"Clearing collection: {collection_name}")
            collection_ref = db.collection(collection_name)
            docs = collection_ref.stream()
            
            deleted_count = 0
            for doc in docs:
                doc.reference.delete()
                deleted_count += 1
                
            print(f"  Deleted {deleted_count} documents from {collection_name}")
            
        print("\nDatabase reset completed successfully!")
        
    except Exception as e:
        print(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_database()