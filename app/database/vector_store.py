import os
from typing import List, Tuple
import numpy as np
# For FAISS implementation
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

# For Pinecone implementation
try:
    import pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False

class VectorStore:
    """Vector store for RAG documents."""
    
    def __init__(self, provider: str = "faiss"):
        self.provider = provider.lower()
        self.dimension = 768  # Default dimension for most embeddings
        
        if self.provider == "faiss" and FAISS_AVAILABLE:
            self._init_faiss()
        elif self.provider == "pinecone" and PINECONE_AVAILABLE:
            self._init_pinecone()
        else:
            raise ValueError(f"Unsupported vector store provider: {provider}")
    
    def _init_faiss(self):
        """Initialize FAISS vector store."""
        self.index_path = os.getenv("FAISS_INDEX_PATH", "data/faiss_index.bin")
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Load existing index if it exists
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
    
    def _init_pinecone(self):
        """Initialize Pinecone vector store."""
        api_key = os.getenv("PINECONE_API_KEY")
        environment = os.getenv("PINECONE_ENVIRONMENT")
        
        if not api_key or not environment:
            raise ValueError("Pinecone API key and environment are required")
        
        pinecone.init(api_key=api_key, environment=environment)
        
        index_name = os.getenv("PINECONE_INDEX_NAME", "ai-voice-agent")
        
        # Create index if it doesn't exist
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(
                name=index_name,
                dimension=self.dimension,
                metric="euclidean"
            )
        
        self.index = pinecone.Index(index_name)
    
    def add_documents(self, embeddings: List[List[float]], document_ids: List[str]):
        """Add documents to the vector store."""
        if self.provider == "faiss":
            self._add_documents_faiss(embeddings, document_ids)
        elif self.provider == "pinecone":
            self._add_documents_pinecone(embeddings, document_ids)
    
    def _add_documents_faiss(self, embeddings: List[List[float]], document_ids: List[str]):
        """Add documents to FAISS vector store."""
        # Convert to numpy array
        embeddings_array = np.array(embeddings).astype('float32')
        
        # Add to index
        self.index.add(embeddings_array)
        
        # Save index
        faiss.write_index(self.index, self.index_path)
    
    def _add_documents_pinecone(self, embeddings: List[List[float]], document_ids: List[str]):
        """Add documents to Pinecone vector store."""
        # Prepare vectors for upsert
        vectors = []
        for i, (embedding, doc_id) in enumerate(zip(embeddings, document_ids)):
            vectors.append({
                "id": doc_id,
                "values": embedding
            })
        
        # Upsert vectors
        self.index.upsert(vectors=vectors)
    
    def search(self, query_embedding: List[float], k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar documents."""
        if self.provider == "faiss":
            return self._search_faiss(query_embedding, k)
        elif self.provider == "pinecone":
            return self._search_pinecone(query_embedding, k)
    
    def _search_faiss(self, query_embedding: List[float], k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar documents in FAISS."""
        # Convert to numpy array
        query_array = np.array([query_embedding]).astype('float32')
        
        # Search
        distances, indices = self.index.search(query_array, k)
        
        # Return results (document IDs and distances)
        results = []
        for i in range(len(indices[0])):
            results.append((str(indices[0][i]), float(distances[0][i])))
        
        return results
    
    def _search_pinecone(self, query_embedding: List[float], k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar documents in Pinecone."""
        # Query
        response = self.index.query(
            vector=query_embedding,
            top_k=k,
            include_values=False
        )
        
        # Return results (document IDs and scores)
        results = []
        for match in response.matches:
            results.append((match.id, match.score))
        
        return results

# Global vector store instance
vector_store = None

def get_vector_store() -> VectorStore:
    """Get the global vector store instance."""
    global vector_store
    if vector_store is None:
        provider = os.getenv("VECTOR_STORE_PROVIDER", "faiss")
        vector_store = VectorStore(provider)
    return vector_store