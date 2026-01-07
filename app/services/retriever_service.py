import os
import chromadb
import numpy as np
from dotenv import load_dotenv
from chromadb.config import Settings
# import openai  <-- No longer needed for embeddings
from sentence_transformers import SentenceTransformer
import logging

# --- Load Environment Variables ---
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Sentence Transformer Model (Lazy loading)
# Using a popular, small, and fast model for RAG
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = None  # Will be loaded on first use

def _get_embedding_model():
    """Lazy load the embedding model on first use"""
    global embedding_model
    if embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}...")
        try:
            embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            logger.info("✅ Embedding model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            embedding_model = None
    return embedding_model


# ChromaDB lazy loading
chroma_client = None
collection = None

def _get_collection():
    """Lazy load ChromaDB collection"""
    global chroma_client, collection
    
    if collection is None:
        try:
            # Initialize client if needed
            if chroma_client is None:
                persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
                chroma_client = chromadb.Client(
                    Settings(
                        persist_directory=persist_dir,
                        anonymized_telemetry=False,
                        is_persistent=True
                    )
                )
                
            # Get or create collection
            collection_name = os.getenv("CHROMA_COLLECTION_NAME", "voice_agent_rag")
            collection = chroma_client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"✅ ChromaDB collection '{collection_name}' loaded")
        except Exception as e:
            logger.error(f"❌ Failed to initialize ChromaDB: {e}")
            return None
            
    return collection

def get_embedding(text: str):
    """
    Generate embedding using HuggingFace 'sentence-transformers/all-MiniLM-L6-v2'.
    """
    try:
        model = _get_embedding_model()
        if not model:
            logger.error("Embedding model not initialized.")
            return None

        clean_text = text.replace("\n", " ")
        # encode returns valid numpy array, we convert to list for Chroma/JSON
        embeddings = model.encode(clean_text)
        return embeddings.tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None

def store_memory(client_id: str, text: str, metadata: dict | None = None):
    """
    Save a text chunk into ChromaDB.
    """
    if not text or not text.strip():
        return "Empty text, skipped."

    embedding = get_embedding(text)
    if not embedding:
        return "Embedding generation failed"

    # Get collection (lazy load)
    coll = _get_collection()
    if not coll:
        return "Database unavailable"

    # Create a unique ID for the document
    import uuid
    doc_id = f"{client_id}_{uuid.uuid4()}"
    
    if metadata is None:
        metadata = {}
    metadata["client_id"] = str(client_id)
    metadata["timestamp"] = str(os.times())

    try:
        coll.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata],
            embeddings=[embedding]
        )
        logger.info(f"Stored RAG document for client {client_id}")
        return f"✅ Stored memory for {client_id}"
    except Exception as e:
        logger.error(f"Error storing in Chroma: {e}")
        return f"Error: {e}"

def get_relevant_context(query: str, client_id: str, n_results: int = 3):
    """
    Retrieve top N relevant contexts for the query and client_id.
    """
    if not query or not query.strip():
        logger.info("Empty query provided to RAG, returning empty results")
        return []

    # Get query embedding
    query_embedding = get_embedding(query)
    if not query_embedding:
        logger.warning(f"Could not generate embedding for query: '{query}'")
        return []
    
    # Get collection (lazy load)
    coll = _get_collection()
    if not coll:
        logger.warning("ChromaDB collection unavailable")
        return []

    try:
        logger.info(f"Querying RAG for client {client_id} with query: '{query}'")
        results = coll.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where={"client_id": str(client_id)} 
        )

        documents = results.get("documents", [])
        if documents and len(documents) > 0:
            relevant_docs = [doc for doc in documents[0] if doc and doc.strip()]
            logger.info(f"Retrieved {len(relevant_docs)} docs for client {client_id}")
            
            # Log the actual documents for debugging
            for i, doc in enumerate(relevant_docs):
                logger.info(f"Document {i+1}: {doc[:100]}...")
            
            return relevant_docs
        else:
            logger.info(f"No documents found for client {client_id}, checking if any documents exist in collection")
            # Check if any documents exist at all for debugging
            all_docs = coll.get(where={"client_id": str(client_id)})
            if all_docs and all_docs.get("documents"):
                logger.info(f"Found {len(all_docs['documents'])} total documents for client {client_id} but none matched query")
            else:
                logger.info(f"No documents at all found for client {client_id}")
        
        return []
    except Exception as e:
        logger.error(f"Error retrieving context from Chroma: {e}")
        return []
