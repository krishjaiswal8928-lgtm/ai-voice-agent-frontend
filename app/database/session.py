from app.database.firestore import db

# Dependency
def get_db():
    """
    Dependency to get the Firestore database client.
    Replaces the SQLAlchemy get_db session yielder.
    """
    if db is None:
        raise ConnectionError("Firestore client is not initialized. Check your serviceAccountKey.json.")
    try:
        yield db
    finally:
        # Firestore client doesn't need explicit closing like a SQL session
        pass
