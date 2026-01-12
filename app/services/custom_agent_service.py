import json
import sqlite3
from typing import List, Dict, Any, Optional, Union
from google.cloud import firestore
from app.models.custom_agent import CustomAgent
import uuid

class CustomAgentService:
    """Service for managing custom agents with Firebase as primary and SQLite as fallback"""
    
    def __init__(self, db: firestore.Client = None):
        self.db = db
        self.use_firebase = db is not None
    
    def _init_sqlite_db(self):
        """Initialize SQLite database tables"""
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            # Create custom_agents table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS custom_agents (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,  -- Changed to TEXT to accommodate both int and string user_ids
                    name TEXT NOT NULL,
                    description TEXT,
                    llm_provider TEXT,
                    tts_provider TEXT,
                    stt_provider TEXT,
                    personality TEXT,
                    tone TEXT,
                    response_style TEXT,
                    politeness_level REAL,
                    sales_aggressiveness REAL,
                    confidence_level REAL,
                    system_prompt TEXT,
                    trained_documents TEXT,
                    website_urls TEXT,
                    vector_db_namespace TEXT,
                    phone_number_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error initializing SQLite database: {e}")
            return False
    
    def create_agent(self, user_id: Union[int, str], agent_data: Dict[str, Any]) -> CustomAgent:
        """Create a new agent"""
        # Try Firebase first (now that it's enabled)
        if self.use_firebase:
            try:
                # Firebase implementation
                agent_dict = {
                    "user_id": user_id,  # Keep as is for Firestore
                    "name": agent_data["name"],
                    "description": agent_data.get("description", ""),
                    "llm_provider": agent_data.get("llm_provider", "gemini"),
                    "tts_provider": agent_data.get("tts_provider", "deepgram"),
                    "stt_provider": agent_data.get("stt_provider", "deepgram"),
                    "personality": agent_data.get("personality", "helpful"),
                    "tone": agent_data.get("tone", "professional"),
                    "response_style": agent_data.get("response_style", "concise"),
                    "politeness_level": agent_data.get("politeness_level", 0.8),
                    "sales_aggressiveness": agent_data.get("sales_aggressiveness", 0.5),
                    "confidence_level": agent_data.get("confidence_level", 0.9),
                    "system_prompt": agent_data.get("system_prompt", ""),
                    "trained_documents": json.dumps(agent_data.get("trained_documents", [])),
                    "website_urls": json.dumps(agent_data.get("website_urls", [])),
                    "website_urls": json.dumps(agent_data.get("website_urls", [])),
                    "vector_db_namespace": agent_data.get("vector_db_namespace", ""),
                    "phone_number_id": agent_data.get("phone_number_id")
                }
                
                doc_ref = self.db.collection('custom_agents').document()
                doc_ref.set(agent_dict)
                
                return CustomAgent.from_dict(agent_dict, doc_ref.id)
            except Exception as e:
                print(f"Firebase create_agent failed: {e}")
                # Continue to SQLite fallback
        
        # SQLite fallback implementation
        self._init_sqlite_db()
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            agent_id = str(uuid.uuid4())
            
            agent_dict = {
                "user_id": str(user_id),  # Convert to string for SQLite
                "name": str(agent_data["name"]),
                "description": str(agent_data.get("description", "")),
                "llm_provider": str(agent_data.get("llm_provider", "gemini")),
                "tts_provider": str(agent_data.get("tts_provider", "deepgram")),
                "stt_provider": str(agent_data.get("stt_provider", "deepgram")),
                "personality": str(agent_data.get("personality", "helpful")),
                "tone": str(agent_data.get("tone", "professional")),
                "response_style": str(agent_data.get("response_style", "concise")),
                "politeness_level": float(agent_data.get("politeness_level", 0.8)),
                "sales_aggressiveness": float(agent_data.get("sales_aggressiveness", 0.5)),
                "confidence_level": float(agent_data.get("confidence_level", 0.9)),
                "system_prompt": str(agent_data.get("system_prompt", "")),
                "trained_documents": json.dumps(agent_data.get("trained_documents", [])),
                "website_urls": json.dumps(agent_data.get("website_urls", [])),
                "website_urls": json.dumps(agent_data.get("website_urls", [])),
                "vector_db_namespace": str(agent_data.get("vector_db_namespace", "")),
                "phone_number_id": str(agent_data.get("phone_number_id")) if agent_data.get("phone_number_id") else None
            }
            
            cursor.execute('''
                INSERT INTO custom_agents (
                    id, user_id, name, description, llm_provider, tts_provider, stt_provider,
                    personality, tone, response_style, politeness_level, sales_aggressiveness,
                    confidence_level, system_prompt, trained_documents, website_urls, vector_db_namespace, phone_number_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                agent_id, agent_dict["user_id"], agent_dict["name"], agent_dict["description"],
                agent_dict["llm_provider"], agent_dict["tts_provider"], agent_dict["stt_provider"],
                agent_dict["personality"], agent_dict["tone"], agent_dict["response_style"],
                agent_dict["politeness_level"], agent_dict["sales_aggressiveness"],
                agent_dict["confidence_level"], agent_dict["system_prompt"],
                agent_dict["trained_documents"], agent_dict["website_urls"],
                agent_dict["vector_db_namespace"], agent_dict["phone_number_id"]
            ))
            
            conn.commit()
            conn.close()
            
            return CustomAgent.from_dict(agent_dict, agent_id)
        except Exception as e:
            print(f"SQLite create_agent failed: {e}")
            raise e
            
    def get_agent_by_id(self, agent_id: str, user_id: Union[int, str]) -> Optional[CustomAgent]:
        """Get an agent by ID"""
        # Try Firebase first (now that it's enabled)
        if self.use_firebase:
            try:
                # Firebase implementation
                doc_ref = self.db.collection('custom_agents').document(agent_id)
                doc = doc_ref.get()
                
                if doc.exists:
                    agent_data = doc.to_dict()
                    # Check if the agent belongs to the user (handle both int and str)
                    agent_user_id = agent_data.get("user_id")
                    if str(agent_user_id) == str(user_id):
                        return CustomAgent.from_dict(agent_data, doc.id)
                return None
            except Exception as e:
                print(f"Firebase get_agent_by_id failed: {e}")
                # Continue to SQLite fallback
        
        # SQLite fallback implementation
        self._init_sqlite_db()
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT * FROM custom_agents WHERE id = ? AND user_id = ?",
                (agent_id, str(user_id))  # Convert to string for comparison
            )
            row = cursor.fetchone()
            conn.close()
            
            if row:
                # Convert row to dict
                columns = [description[0] for description in cursor.description]
                agent_data = dict(zip(columns, row))
                # Parse JSON fields
                try:
                    agent_data["trained_documents"] = json.loads(agent_data["trained_documents"])
                except:
                    agent_data["trained_documents"] = []
                try:
                    agent_data["website_urls"] = json.loads(agent_data["website_urls"])
                except:
                    agent_data["website_urls"] = []
                return CustomAgent.from_dict(agent_data, agent_data["id"])
            return None
        except Exception as e:
            print(f"SQLite get_agent_by_id failed: {e}")
            return None
            
    def get_user_agents(self, user_id: Union[int, str]) -> List[CustomAgent]:
        """Get all agents for a user"""
        # Try Firebase first (now that it's enabled)
        if self.use_firebase:
            try:
                # Firebase implementation
                agents_ref = self.db.collection('custom_agents')
                docs = agents_ref.where('user_id', '==', user_id).stream()
                
                agents = []
                for doc in docs:
                    agents.append(CustomAgent.from_dict(doc.to_dict(), doc.id))
                    
                return agents
            except Exception as e:
                print(f"Firebase get_user_agents failed: {e}")
                # Continue to SQLite fallback
        
        # SQLite fallback implementation
        self._init_sqlite_db()
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM custom_agents WHERE user_id = ?", (str(user_id),))  # Convert to string
            rows = cursor.fetchall()
            conn.close()
            
            agents = []
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    agent_data = dict(zip(columns, row))
                    # Parse JSON fields
                    try:
                        agent_data["trained_documents"] = json.loads(agent_data["trained_documents"])
                    except:
                        agent_data["trained_documents"] = []
                    try:
                        agent_data["website_urls"] = json.loads(agent_data["website_urls"])
                    except:
                        agent_data["website_urls"] = []
                    agents.append(CustomAgent.from_dict(agent_data, agent_data["id"]))
                    
            return agents
        except Exception as e:
            print(f"SQLite get_user_agents failed: {e}")
            return []
    
    def update_agent(self, agent_id: str, user_id: Union[int, str], agent_data: Dict[str, Any]) -> Optional[CustomAgent]:
        """Update an existing agent"""
        # Check if agent exists and belongs to user
        agent = self.get_agent_by_id(agent_id, user_id)
        if not agent:
            return None
            
        # Try Firebase first (now that it's enabled)
        if self.use_firebase:
            try:
                # Firebase implementation
                # Build update dict
                updates = {}
                
                if "name" in agent_data:
                    updates["name"] = str(agent_data["name"])
                if "description" in agent_data:
                    updates["description"] = str(agent_data["description"])
                if "llm_provider" in agent_data:
                    updates["llm_provider"] = str(agent_data["llm_provider"])
                if "tts_provider" in agent_data:
                    updates["tts_provider"] = str(agent_data["tts_provider"])
                if "stt_provider" in agent_data:
                    updates["stt_provider"] = str(agent_data["stt_provider"])
                if "personality" in agent_data:
                    updates["personality"] = str(agent_data["personality"])
                if "tone" in agent_data:
                    updates["tone"] = str(agent_data["tone"])
                if "response_style" in agent_data:
                    updates["response_style"] = str(agent_data["response_style"])
                if "politeness_level" in agent_data:
                    updates["politeness_level"] = float(agent_data["politeness_level"])
                if "sales_aggressiveness" in agent_data:
                    updates["sales_aggressiveness"] = float(agent_data["sales_aggressiveness"])
                if "confidence_level" in agent_data:
                    updates["confidence_level"] = float(agent_data["confidence_level"])
                if "system_prompt" in agent_data:
                    updates["system_prompt"] = str(agent_data["system_prompt"])
                if "trained_documents" in agent_data:
                    updates["trained_documents"] = json.dumps(agent_data["trained_documents"])
                if "website_urls" in agent_data:
                    updates["website_urls"] = json.dumps(agent_data["website_urls"])
                if "vector_db_namespace" in agent_data:
                    updates["vector_db_namespace"] = str(agent_data["vector_db_namespace"])
                if "phone_number_id" in agent_data:
                    updates["phone_number_id"] = str(agent_data["phone_number_id"]) if agent_data["phone_number_id"] else None
                
                # Update in Firestore
                doc_ref = self.db.collection('custom_agents').document(agent_id)
                doc_ref.update(updates)
                
                # Return updated agent
                return self.get_agent_by_id(agent_id, user_id)
            except Exception as e:
                print(f"Firebase update_agent failed: {e}")
                # Continue to SQLite fallback
        
        # SQLite fallback implementation
        self._init_sqlite_db()
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            # Build update query dynamically
            update_fields = []
            values = []
            
            if "name" in agent_data:
                update_fields.append("name = ?")
                values.append(str(agent_data["name"]))
            if "description" in agent_data:
                update_fields.append("description = ?")
                values.append(str(agent_data["description"]))
            if "llm_provider" in agent_data:
                update_fields.append("llm_provider = ?")
                values.append(str(agent_data["llm_provider"]))
            if "tts_provider" in agent_data:
                update_fields.append("tts_provider = ?")
                values.append(str(agent_data["tts_provider"]))
            if "stt_provider" in agent_data:
                update_fields.append("stt_provider = ?")
                values.append(str(agent_data["stt_provider"]))
            if "personality" in agent_data:
                update_fields.append("personality = ?")
                values.append(str(agent_data["personality"]))
            if "tone" in agent_data:
                update_fields.append("tone = ?")
                values.append(str(agent_data["tone"]))
            if "response_style" in agent_data:
                update_fields.append("response_style = ?")
                values.append(str(agent_data["response_style"]))
            if "politeness_level" in agent_data:
                update_fields.append("politeness_level = ?")
                values.append(float(agent_data["politeness_level"]))
            if "sales_aggressiveness" in agent_data:
                update_fields.append("sales_aggressiveness = ?")
                values.append(float(agent_data["sales_aggressiveness"]))
            if "confidence_level" in agent_data:
                update_fields.append("confidence_level = ?")
                values.append(float(agent_data["confidence_level"]))
            if "system_prompt" in agent_data:
                update_fields.append("system_prompt = ?")
                values.append(str(agent_data["system_prompt"]))
            if "trained_documents" in agent_data:
                update_fields.append("trained_documents = ?")
                values.append(json.dumps(agent_data["trained_documents"]))
            if "website_urls" in agent_data:
                update_fields.append("website_urls = ?")
                values.append(json.dumps(agent_data["website_urls"]))
            if "vector_db_namespace" in agent_data:
                update_fields.append("vector_db_namespace = ?")
                values.append(str(agent_data["vector_db_namespace"]))
            if "phone_number_id" in agent_data:
                update_fields.append("phone_number_id = ?")
                values.append(str(agent_data["phone_number_id"]) if agent_data["phone_number_id"] else None)
            
            if update_fields:
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                query = f"UPDATE custom_agents SET {', '.join(update_fields)} WHERE id = ? AND user_id = ?"
                values.extend([agent_id, str(user_id)])  # Convert to string for comparison
                
                cursor.execute(query, values)
                conn.commit()
                conn.close()
                
                # Return updated agent
                return self.get_agent_by_id(agent_id, user_id)
            else:
                conn.close()
                return agent
        except Exception as e:
            print(f"SQLite update_agent failed: {e}")
            return None
    
    def delete_agent(self, agent_id: str, user_id: Union[int, str]) -> bool:
        """Delete an agent"""
        # Try Firebase first (now that it's enabled)
        if self.use_firebase:
            try:
                # Firebase implementation
                agent = self.get_agent_by_id(agent_id, user_id)
                if not agent:
                    return False
                    
                doc_ref = self.db.collection('custom_agents').document(agent_id)
                doc_ref.delete()
                return True
            except Exception as e:
                print(f"Firebase delete_agent failed: {e}")
                # Continue to SQLite fallback
        
        # SQLite fallback implementation
        self._init_sqlite_db()
        try:
            conn = sqlite3.connect('./ai_voice_agent.db')
            cursor = conn.cursor()
            
            cursor.execute(
                "DELETE FROM custom_agents WHERE id = ? AND user_id = ?",
                (agent_id, str(user_id))  # Convert to string for comparison
            )
            rows_affected = cursor.rowcount
            conn.commit()
            conn.close()
            
            return rows_affected > 0
        except Exception as e:
            print(f"SQLite delete_agent failed: {e}")
            return False

def get_custom_agent_service(db: firestore.Client = None) -> CustomAgentService:
    """Get the custom agent service instance"""
    # Try to get Firestore client if not provided
    if db is None:
        try:
            from app.database.firestore import db as firestore_db
            if firestore_db is not None:
                return CustomAgentService(firestore_db)
        except:
            pass
    return CustomAgentService(db)