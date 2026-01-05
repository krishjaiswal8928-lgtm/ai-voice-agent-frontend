from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User as UserModel
from app.database.firestore import db
import sqlite3

router = APIRouter(prefix="/users", tags=["Users"])

def get_user_from_sqlite_by_id(user_id: int):
    """Get user from SQLite database by ID"""
    try:
        conn = sqlite3.connect('./ai_voice_agent.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, hashed_password FROM users WHERE id = ?", (user_id,))
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

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information."""
    user_id = current_user.get("user_id")
    username = current_user.get("sub")
    
    user = None
    
    # Try Firebase first
    try:
        if db is not None:
            users_ref = db.collection('users')
            query = users_ref.where('username', '==', username).limit(1).stream()
            
            for doc in query:
                user = UserModel.from_dict(doc.to_dict(), doc.id)
                break
    except Exception as e:
        print(f"Firebase user lookup failed: {e}")
    
    # Fallback to SQLite
    if user is None:
        user = get_user_from_sqlite_by_id(user_id)
    
    if not user:
        return {
            "id": user_id,
            "username": username,
            "email": f"{username}@example.com"
        }
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }
