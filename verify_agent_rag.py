import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from app.services.retriever_service import get_relevant_context

def verify_agent_rag():
    agent_id = "5"  # ID for Karan
    query = "What is this knowledge base about?"
    
    print(f"Testing RAG retrieval for Agent ID: {agent_id}")
    print(f"Query: '{query}'")
    
    try:
        # Access the collection directly to check for existence
        from app.services.retriever_service import collection
        
        print(f"Checking ChromaDB collection for client_id='{agent_id}'...")
        
        # Get all items for this client_id
        result = collection.get(where={"client_id": agent_id})
        
        if result and result['ids']:
            count = len(result['ids'])
            print(f"✅ Found {count} documents in ChromaDB for Agent {agent_id}.")
            
            # Now try retrieval again
            print(f"\nRetrying query: '{query}'")
            results = get_relevant_context(query, agent_id)
            if results:
                print(f"✅ Retrieval successful! Got {len(results)} results.")
            else:
                print("❌ Retrieval failed despite data existence (likely due to mock embeddings).")
        else:
            print(f"❌ No documents found in ChromaDB for Agent {agent_id}.")
            print("   (The documents exist in SQL DB but were not saved to ChromaDB)")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    verify_agent_rag()
