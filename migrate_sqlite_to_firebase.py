#!/usr/bin/env python3
"""
Migrate data from SQLite to Firebase Firestore
"""

import os
import sys
import sqlite3
import json
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def migrate_users():
    """Migrate users from SQLite to Firebase"""
    try:
        # Import Firebase
        from app.database.firestore import db
        if db is None:
            print("Firebase not available")
            return False
            
        # Connect to SQLite
        conn = sqlite3.connect('./ai_voice_agent.db')
        cursor = conn.cursor()
        
        # Get all users from SQLite
        cursor.execute("SELECT id, username, email, hashed_password, is_active, created_at, updated_at FROM users")
        rows = cursor.fetchall()
        
        users_migrated = 0
        for row in rows:
            user_id, username, email, hashed_password, is_active, created_at, updated_at = row
            
            # Check if user already exists in Firebase
            users_ref = db.collection('users')
            query = users_ref.where('username', '==', username).limit(1).stream()
            
            if any(query):
                print(f"User {username} already exists in Firebase, skipping...")
                continue
            
            # Convert timestamp strings to datetime objects if needed
            try:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            except:
                created_at = datetime.now()
                updated_at = datetime.now()
            
            # Create user in Firebase
            user_data = {
                "username": username,
                "email": email,
                "hashed_password": hashed_password,
                "is_active": is_active,
                "created_at": created_at,
                "updated_at": updated_at
            }
            
            users_ref.add(user_data)
            users_migrated += 1
            print(f"Migrated user: {username}")
        
        conn.close()
        print(f"Successfully migrated {users_migrated} users to Firebase")
        return True
        
    except Exception as e:
        print(f"Error migrating users: {e}")
        return False

def migrate_custom_agents():
    """Migrate custom agents from SQLite to Firebase"""
    try:
        # Import Firebase
        from app.database.firestore import db
        if db is None:
            print("Firebase not available")
            return False
            
        # Connect to SQLite
        conn = sqlite3.connect('./ai_voice_agent.db')
        cursor = conn.cursor()
        
        # Get all custom agents from SQLite
        cursor.execute("""
            SELECT id, user_id, name, description, llm_provider, tts_provider, stt_provider,
                   personality, tone, response_style, politeness_level, sales_aggressiveness,
                   confidence_level, system_prompt, trained_documents, website_urls, 
                   vector_db_namespace, created_at, updated_at
            FROM custom_agents
        """)
        rows = cursor.fetchall()
        
        agents_migrated = 0
        for row in rows:
            (agent_id, user_id, name, description, llm_provider, tts_provider, stt_provider,
             personality, tone, response_style, politeness_level, sales_aggressiveness,
             confidence_level, system_prompt, trained_documents, website_urls, 
             vector_db_namespace, created_at, updated_at) = row
            
            # Check if agent already exists in Firebase
            agents_ref = db.collection('custom_agents')
            query = agents_ref.where('id', '==', agent_id).limit(1).stream()
            
            if any(query):
                print(f"Agent {name} already exists in Firebase, skipping...")
                continue
            
            # Convert timestamp strings to datetime objects if needed
            try:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            except:
                created_at = datetime.now()
                updated_at = datetime.now()
            
            # Parse JSON strings
            try:
                if isinstance(trained_documents, str):
                    trained_documents = json.loads(trained_documents)
                if isinstance(website_urls, str):
                    website_urls = json.loads(website_urls)
            except:
                trained_documents = []
                website_urls = []
            
            # Create agent in Firebase
            agent_data = {
                "user_id": user_id,
                "name": name,
                "description": description,
                "llm_provider": llm_provider,
                "tts_provider": tts_provider,
                "stt_provider": stt_provider,
                "personality": personality,
                "tone": tone,
                "response_style": response_style,
                "politeness_level": float(politeness_level) if politeness_level else 0.8,
                "sales_aggressiveness": float(sales_aggressiveness) if sales_aggressiveness else 0.5,
                "confidence_level": float(confidence_level) if confidence_level else 0.9,
                "system_prompt": system_prompt,
                "trained_documents": trained_documents,
                "website_urls": website_urls,
                "vector_db_namespace": vector_db_namespace,
                "is_active": 1,
                "created_at": created_at,
                "updated_at": updated_at
            }
            
            agents_ref.document(agent_id).set(agent_data)
            agents_migrated += 1
            print(f"Migrated agent: {name}")
        
        conn.close()
        print(f"Successfully migrated {agents_migrated} custom agents to Firebase")
        return True
        
    except Exception as e:
        print(f"Error migrating custom agents: {e}")
        return False

def main():
    """Main migration function"""
    print("Starting migration from SQLite to Firebase...")
    
    # Test Firebase connection
    try:
        from app.database.firestore import db
        if db is None:
            print("Firebase is not properly configured. Please check your service account key and Firestore API.")
            return
        print("Firebase connection successful")
    except Exception as e:
        print(f"Firebase connection failed: {e}")
        return
    
    # Migrate users
    print("\nMigrating users...")
    if not migrate_users():
        print("User migration failed")
        return
    
    # Migrate custom agents
    print("\nMigrating custom agents...")
    if not migrate_custom_agents():
        print("Custom agent migration failed")
        return
    
    print("\nMigration completed successfully!")

if __name__ == "__main__":
    main()