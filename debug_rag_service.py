
import os
import sys
import asyncio
from unittest.mock import MagicMock

# Add current directory to path
sys.path.append(os.getcwd())

async def test_rag_service():
    print("1. Testing imports...")
    
    deps = [
        "os", "asyncio", "logging", "requests", "PyPDF2", "docx", "bs4",
        "langchain_text_splitters", 
        "langchain_google_genai", 
        "google.cloud.firestore",
        "app.models.rag_document",
        "app.database.vector_store",
        "app.services.retriever_service"
    ]
    
    for dep in deps:
        print(f"   Importing {dep}...", end="", flush=True)
        try:
            __import__(dep)
            print(" Done.")
        except Exception as e:
            print(f" FAILED: {e}")

    print("2. Importing get_rag_service...")
    try:
        from app.services.rag_service import get_rag_service
        print("   Import successful.")
    except Exception as e:
        print(f"   Import FAILED: {e}")
        return

    print("2. initializing RAG Service...")
    try:
        service = get_rag_service()
        print("   Initialization successful.")
    except Exception as e:
        print(f"   Initialization FAILED: {e}")
        import traceback
        traceback.print_exc()
        return

    print("3. Calling start_crawl_task...")
    try:
        # Mock DB
        mock_db = MagicMock()
        
        # Call start_crawl_task
        task_id = await service.start_crawl_task(
            domain_url="https://example.com",
            campaign_id="test_campaign",
            db=mock_db,
            agent_id="test_agent",
            max_pages=5
        )
        print(f"   Task start successful. Task ID: {task_id}")
    except Exception as e:
        print(f"   Task start FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_rag_service())
