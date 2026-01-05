# init_db.py
"""
Database initialization script
"""

from app.database.base import Base
from app.database.session import engine
from app.models import user, campaign, lead, conversation, goal, rag_document

def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()