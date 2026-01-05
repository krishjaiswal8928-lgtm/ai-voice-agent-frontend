#!/usr/bin/env python3
"""
Create a default admin user for testing (SQLite version)
"""

import os
import sys
import sqlite3
from app.core.security import get_password_hash

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_default_user():
    """Create a default admin user in SQLite"""
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('./ai_voice_agent.db')
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if admin user already exists
        cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
        existing_user = cursor.fetchone()
        if existing_user:
            print("Admin user already exists")
            conn.close()
            return
        
        # Create admin user
        hashed_password = get_password_hash("admin")
        cursor.execute(
            "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
            ("admin", "admin@example.com", hashed_password)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"Created admin user with ID: {user_id}")
        print("Username: admin")
        print("Password: admin")
        
    except Exception as e:
        print(f"Error creating user: {e}")

if __name__ == "__main__":
    create_default_user()