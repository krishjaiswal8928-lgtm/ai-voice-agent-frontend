import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_voice_agent.db")

def migrate_rag_documents():
    """Add new columns to rag_documents table"""
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.begin() as conn:
        # Check if columns exist
        result = conn.execute(text("PRAGMA table_info(rag_documents)"))
        columns = [row[1] for row in result.fetchall()]
        
        print(f"Current columns: {columns}")
        
        # Add agent_id column
        if "agent_id" not in columns:
            print("Adding agent_id column...")
            try:
                conn.execute(text("ALTER TABLE rag_documents ADD COLUMN agent_id INTEGER REFERENCES custom_agents(id) ON DELETE CASCADE"))
                print("Added agent_id column")
            except Exception as e:
                print(f"Error adding agent_id column: {e}")
        else:
            print("agent_id column already exists")
            
        # Add title column
        if "title" not in columns:
            print("Adding title column...")
            try:
                conn.execute(text("ALTER TABLE rag_documents ADD COLUMN title VARCHAR"))
                print("Added title column")
            except Exception as e:
                print(f"Error adding title column: {e}")
        else:
            print("title column already exists")
            
        # Add chunks_extracted column
        if "chunks_extracted" not in columns:
            print("Adding chunks_extracted column...")
            try:
                conn.execute(text("ALTER TABLE rag_documents ADD COLUMN chunks_extracted INTEGER DEFAULT 0"))
                print("Added chunks_extracted column")
            except Exception as e:
                print(f"Error adding chunks_extracted column: {e}")
        else:
            print("chunks_extracted column already exists")
            
        # Transaction is automatically committed when exiting the context manager
        print("Migration completed successfully")

if __name__ == "__main__":
    migrate_rag_documents()
