#!/usr/bin/env python3
"""
Debug script to test ChromaDB functionality
"""

import os
import sys
import numpy as np
import chromadb
from chromadb.config import Settings

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_mock_embedding(text: str):
    """Generate mock embedding for testing"""
    hash_value = abs(hash(text)) % 1000000
    np.random.seed(hash_value)
    return np.random.rand(768).tolist()

def debug_chroma():
    """Debug ChromaDB functionality"""
    print("Debugging ChromaDB...")
    
    # Initialize ChromaDB
    chroma_client = chromadb.Client(
        Settings(
            persist_directory="./chroma_data",
            anonymized_telemetry=False
        )
    )
    
    # Get or create collection
    collection = chroma_client.get_or_create_collection(name="test_collection")
    print(f"Collection created: {collection.name}")
    
    # Add some test data
    texts = [
        "This is a test document about AI voice agents",
        "The platform supports multiple languages including English and Hindi",
        "Key features include real-time voice processing and RAG integration"
    ]
    
    embeddings = [get_mock_embedding(text) for text in texts]
    ids = [f"doc_{i}" for i in range(len(texts))]
    metadatas = [{"source": "test", "index": i} for i in range(len(texts))]
    
    print(f"Adding {len(texts)} documents to collection...")
    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )
    
    # Check collection count
    count = collection.count()
    print(f"Collection count: {count}")
    
    # List all documents
    all_docs = collection.get()
    print(f"All documents: {all_docs['ids']}")
    
    # Test query
    query_text = "What are the key features of the platform?"
    query_embedding = get_mock_embedding(query_text)
    
    print(f"\nQuerying with: {query_text}")
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    print(f"Query results: {results}")
    
    documents = results.get("documents", [[]])
    print(f"Retrieved documents: {documents}")

if __name__ == "__main__":
    debug_chroma()