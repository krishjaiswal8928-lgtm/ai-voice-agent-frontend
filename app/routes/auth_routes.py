from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore
from datetime import timedelta
from app.dependencies import get_db
from app.schemas.user import UserCreate, User
from app.models.user import User as UserModel
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.security import ACCESS_TOKEN_EXPIRE_MINUTES
import os
import sqlite3
# Google OAuth imports
from google.auth.transport import requests
from google.oauth2 import id_token
import os
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Fallback to SQLite if Firestore is not available
def get_user_from_sqlite(username: str):
    """Get user from SQLite database as fallback"""
    try:
        conn = sqlite3.connect('./ai_voice_agent.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, hashed_password FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return UserModel(
                id=row[0],
                username=row[1],
                email=row[2],
                hashed_password=row[3]
            )
        return None
    except Exception:
        return None

def create_user_in_sqlite(user_data: dict):
    """Create user in SQLite database as fallback"""
    try:
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
        
        # Insert user
        cursor.execute(
            "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
            (user_data["username"], user_data["email"], user_data["hashed_password"])
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return UserModel(
            id=user_id,
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=user_data["hashed_password"]
        )
    except Exception as e:
        print(f"Error creating user in SQLite: {e}")
        return None

def get_or_create_user_by_email(email: str, username: str = None, google_id: str = None, profile_picture: str = None):
    """Get existing user by email or create a new one (supports OAuth)"""
    user = None
    
    # Try Firebase first
    try:
        from app.database.firestore import db
        if db is not None:
            users_ref = db.collection('users')
            query = users_ref.where('email', '==', email).limit(1).stream()
            
            for doc in query:
                user = UserModel.from_dict(doc.to_dict(), doc.id)
                break
    except Exception as e:
        print(f"Firebase user lookup failed: {e}")
    
    # If Firebase failed, try SQLite as fallback
    if user is None:
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, email, hashed_password FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                user = UserModel(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    hashed_password=row[3]
                )
        except Exception as e:
            print(f"SQLite user lookup failed: {e}")
    
    # If user doesn't exist, create a new one
    if user is None:
        # Generate a username if not provided
        if username is None:
            # Use email prefix as username
            username = email.split('@')[0]
            # Ensure username is unique
            counter = 1
            original_username = username
            while True:
                # Check if username exists in Firebase
                username_exists = False
                try:
                    from app.database.firestore import db
                    if db is not None:
                        users_ref = db.collection('users')
                        query = users_ref.where('username', '==', username).limit(1).stream()
                        if any(query):
                            username_exists = True
                except Exception:
                    pass
                
                # Check if username exists in SQLite
                if not username_exists:
                    try:
                        conn = sqlite3.connect('./ai_voice_agent.db')
                        cursor = conn.cursor()
                        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                        row = cursor.fetchone()
                        conn.close()
                        if row:
                            username_exists = True
                    except Exception:
                        pass
                
                if not username_exists:
                    break
                
                username = f"{original_username}_{counter}"
                counter += 1
        
        # Create new user with OAuth support
        import secrets
        
        # For OAuth users, we don't need a real password
        if google_id:
            hashed_password = None
            auth_provider = "google"
        else:
            random_password = secrets.token_urlsafe(16)
            hashed_password = get_password_hash(random_password)
            auth_provider = "email"
        
        user_data = {
            "username": username,
            "email": email,
            "auth_provider": auth_provider
        }
        
        # Add optional fields
        if hashed_password:
            user_data["hashed_password"] = hashed_password
        if google_id:
            user_data["google_id"] = google_id
        if profile_picture:
            user_data["profile_picture"] = profile_picture
        
        # Try to create user in Firebase
        try:
            from app.database.firestore import db
            if db is not None:
                users_ref = db.collection('users')
                
                db_user = UserModel(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=user_data["hashed_password"]
                )
                
                # Add to Firestore
                update_time, doc_ref = users_ref.add(db_user.to_dict())
                db_user.id = doc_ref.id
                
                return db_user
        except Exception as e:
            print(f"Firebase user creation failed: {e}")
        
        # Fallback to SQLite
        db_user = create_user_in_sqlite(user_data)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        return db_user
    
    return user

@router.post("/login", response_model=dict)
async def login(user_credentials: dict):
    """Login endpoint with Firebase as primary and SQLite as fallback."""
    username = user_credentials.get("username")
    password = user_credentials.get("password")
    
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )
    
    user = None
    
    # Try Firebase first (now that it's enabled)
    try:
        from app.database.firestore import db
        if db is not None:
            users_ref = db.collection('users')
            query = users_ref.where('username', '==', username).limit(1).stream()
            
            for doc in query:
                user = UserModel.from_dict(doc.to_dict(), doc.id)
                break
    except Exception as e:
        print(f"Firebase login failed: {e}")
        # Fallback to SQLite
        user = get_user_from_sqlite(username)
    
    # If Firebase failed, try SQLite as fallback
    if user is None:
        user = get_user_from_sqlite(username)
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    """Register endpoint with Firebase as primary and SQLite as fallback."""
    # Try Firebase first (now that it's enabled)
    try:
        from app.database.firestore import db
        if db is not None:
            users_ref = db.collection('users')
            
            # Check if user already exists
            query = users_ref.where('username', '==', user.username).limit(1).stream()
            if any(query):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            
            # Check if email already exists
            query = users_ref.where('email', '==', user.email).limit(1).stream()
            if any(query):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Create new user
            hashed_password = get_password_hash(user.password)
            db_user = UserModel(
                username=user.username,
                email=user.email,
                hashed_password=hashed_password
            )
            
            # Add to Firestore
            update_time, doc_ref = users_ref.add(db_user.to_dict())
            db_user.id = doc_ref.id
            
            return db_user
    except Exception as e:
        print(f"Firebase registration failed: {e}")
        # Continue to SQLite fallback
    
    # Fallback to SQLite
    # Check if user already exists in SQLite
    existing_user = get_user_from_sqlite(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user in SQLite
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    db_user = create_user_in_sqlite(user_data)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return db_user

@router.post("/google", response_model=dict)
async def google_auth(credentials: dict):
    """Google OAuth authentication endpoint."""
    id_token_str = credentials.get("id_token")
    
    if not id_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID token is required"
        )
    
    try:
        # Verify the ID token with CLIENT_ID
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        
        if not CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables."
            )
        
        idinfo = id_token.verify_oauth2_token(
            id_token_str, 
            requests.Request(),
            CLIENT_ID
        )
        
        # Check issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        # Get user info from Google
        email = idinfo['email']
        username = idinfo.get('name', email.split('@')[0])
        google_id = idinfo.get('sub')  # Google user ID
        profile_picture = idinfo.get('picture')  # Profile picture URL
        
        # Get or create user with OAuth data
        user = get_or_create_user_by_email(
            email=email, 
            username=username, 
            google_id=google_id,
            profile_picture=profile_picture
        )
        
        # Convert user to dictionary for serialization
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "auth_provider": user.auth_provider,
            "profile_picture": user.profile_picture
        }
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id}, 
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_dict}
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google ID token"
        )
    except Exception as e:
        print(f"Google auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate with Google"
        )

@router.post("/refresh", response_model=dict)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh token endpoint."""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user["sub"], "user_id": current_user["user_id"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}