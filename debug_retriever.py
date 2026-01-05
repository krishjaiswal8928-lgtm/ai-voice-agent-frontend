#!/usr/bin/env python3
"""
Debug script to test the retriever service functionality
"""

import os
import sys
import numpy as np

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.retriever_service import store_memory, get_relevant_context, collection

def debug_retriever():
    """Debug the retriever service"""
    print("Debugging retriever service...")
    
    # Clear the collection first
    try:
        collection.delete(where={"client_id": "test_campaign"})
        print("Cleared existing test data")
    except:
        print("No existing test data to clear")
    
    # Add test data
    test_chunks = [
        "Welcome to TechCorp Solutions! We specialize in providing cutting-edge AI solutions for businesses.",
        "Our flagship product is the AI Voice Agent Platform, which helps companies automate customer service and sales calls.",
        "The platform features real-time voice processing with Twilio integration for seamless communication.",
        "Advanced RAG (Retrieval Augmented Generation) ensures accurate responses based on your documentation.",
        "Multi-language support includes English and Hindi for global accessibility."
    ]
    
    print(f"Storing {len(test_chunks)} chunks...")
    for i, chunk in enumerate(test_chunks):
        result = store_memory("test_campaign", chunk, {"source": "test_document", "chunk_index": i})
        print(f"  {result}")
    
    # Check what's in the collection
    all_data = collection.get()
    print(f"\nCollection contents:")
    print(f"  IDs: {all_data['ids']}")
    print(f"  Documents count: {len(all_data['documents'])}")
    if all_data['metadatas']:
        print(f"  Metadatas: {all_data['metadatas']}")
    
    # Filter by client_id
    filtered_data = collection.get(where={"client_id": "test_campaign"})
    print(f"\nFiltered data for test_campaign:")
    print(f"  IDs: {filtered_data['ids']}")
    print(f"  Documents count: {len(filtered_data['documents'])}")
    
    # Test query without filter first
    print(f"\nTesting query without filter...")
    from app.services.retriever_service import get_embedding
    query_text = "What are the key features of your platform?"
    query_embedding = get_embedding(query_text)
    
    results_no_filter = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    print(f"Results without filter: {results_no_filter['documents']}")
    
    # Test query with filter
    print(f"\nTesting query with filter...")
    results_with_filter = collection.query(
        query_embeddings=[query_embedding],
        n_results=3,
        where={"client_id": "test_campaign"}
    )
    print(f"Results with filter: {results_with_filter['documents']}")
    
    # Test the actual function
    print(f"\nTesting get_relevant_context function...")
    relevant_context = get_relevant_context(query_text, "test_campaign", n_results=3)
    print(f"Retrieved context: {relevant_context}")
    
    if relevant_context:
        print("✅ RAG retrieval is working!")
        for i, context in enumerate(relevant_context, 1):
            print(f"  {i}. {context[:100]}...")
    else:
        print("❌ RAG retrieval failed!")

if __name__ == "__main__":
    debug_retriever()