#!/usr/bin/env python3
"""
Create a default admin user in Firebase Firestore for testing
"""

import os
import sys
from datetime import datetime
from app.database.firestore import db
from app.core.security import get_password_hash

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_default_firebase_user():
    """Create a default admin user in Firebase Firestore"""
    try:
        # Get the users collection
        users_ref = db.collection('users')
        
        # Check if admin user already exists
        query = users_ref.where('username', '==', 'admin').limit(1).stream()
        if any(query):
            print("Admin user already exists in Firebase")
            return
        
        # Create admin user
        hashed_password = get_password_hash("admin")
        admin_user_data = {
            "username": "admin",
            "email": "admin@example.com",
            "hashed_password": hashed_password,
            "is_active": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Add to Firestore
        doc_ref = users_ref.add(admin_user_data)
        
        print(f"Created admin user in Firebase with ID: {doc_ref[1].id}")
        print("Username: admin")
        print("Password: admin")
        
    except Exception as e:
        print(f"Error creating Firebase user: {e}")

if __name__ == "__main__":
    create_default_firebase_user()