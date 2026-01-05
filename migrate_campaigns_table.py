"""
Migration script to add custom_agent_id column to campaigns table
"""
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import sessionmaker
from app.database.session import engine

def migrate_campaigns_table():
    """Add custom_agent_id column to campaigns table"""
    try:
        # Add the custom_agent_id column to the campaigns table
        with engine.connect() as connection:
            # Check if the column already exists
            result = connection.execute("PRAGMA table_info(campaigns)")
            columns = [row[1] for row in result]
            
            if 'custom_agent_id' not in columns:
                # Add the column
                connection.execute("ALTER TABLE campaigns ADD COLUMN custom_agent_id INTEGER REFERENCES custom_agents(id)")
                print("Added custom_agent_id column to campaigns table")
            else:
                print("custom_agent_id column already exists in campaigns table")
                
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed with error: {e}")
        raise

if __name__ == "__main__":
    migrate_campaigns_table()