"""
Quick script to find your user_id from Firestore
"""

from app.database.firestore import db

def list_all_users():
    """List all users in the Firestore database"""
    users_ref = db.collection('users')
    users = users_ref.stream()
    
    print("📋 Users in database:")
    print("-" * 60)
    
    for user_doc in users:
        user_data = user_doc.to_dict()
        user_id = user_doc.id
        email = user_data.get('email', 'N/A')
        username = user_data.get('username', 'N/A')
        
        print(f"User ID: {user_id}")
        print(f"  Email: {email}")
        print(f"  Username: {username}")
        print("-" * 60)

if __name__ == "__main__":
    list_all_users()
