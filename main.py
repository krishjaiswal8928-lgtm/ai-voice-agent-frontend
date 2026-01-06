import os
import logging
import asyncio
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Defer imports that might cause issues at startup
# from app.routes import (
#     auth_routes,
#     campaign_routes,
#     rag_routes,
#     lead_routes,
#     voice_routes,
#     report_routes,
#     twilio_routes,
#     client_routes,
#     knowledge_routes,
#     custom_agent_routes,
#     phone_number_routes  # Add phone number routes
# )

print("DEBUG: Importing auth_routes... SKIPPING FOR DEBUG")
# import app.routes.auth_routes as auth_routes
print("DEBUG: Importing campaign_routes...")
import app.routes.campaign_routes as campaign_routes
print("DEBUG: Importing rag_routes...")
import app.routes.rag_routes as rag_routes
print("DEBUG: Importing lead_routes...")
import app.routes.lead_routes as lead_routes
print("DEBUG: Importing voice_routes...")
import app.routes.voice_routes as voice_routes
print("DEBUG: Importing report_routes...")
import app.routes.report_routes as report_routes
print("DEBUG: Importing twilio_routes...")
import app.routes.twilio_routes as twilio_routes
print("DEBUG: Importing client_routes...")
import app.routes.client_routes as client_routes
print("DEBUG: Importing knowledge_routes...")
import app.routes.knowledge_routes as knowledge_routes
print("DEBUG: Importing custom_agent_routes...")
import app.routes.custom_agent_routes as custom_agent_routes
print("DEBUG: Importing phone_number_routes...")
import app.routes.phone_number_routes as phone_number_routes
print("DEBUG: Importing integration_routes...")
import app.routes.integration_routes as integration_routes
print("DEBUG: Importing pricing_routes...")
import app.routes.pricing_routes as pricing_routes
print("DEBUG: Importing user_routes...")
import app.routes.user_routes as user_routes
print("DEBUG: Importing security...")

from app.core import security
print("DEBUG: Importing callback_scheduler...")
from app.services.callback_scheduler import callback_scheduler
print("DEBUG: Importing outbound_service...")
from app.services.outbound_service import outbound_manager
print("DEBUG: All imports done.")

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Voice Agent SaaS Platform",
    description="AI Voice Agent Platform with Twilio Integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Register routers
# app.include_router(auth_routes.router)
app.include_router(campaign_routes.router)
app.include_router(rag_routes.router)
app.include_router(lead_routes.router)
app.include_router(voice_routes.router)
app.include_router(report_routes.router)
app.include_router(twilio_routes.router, prefix="/twilio", tags=["Twilio"])
app.include_router(client_routes.router, prefix="/clients", tags=["Clients"])
app.include_router(knowledge_routes.router, prefix="/knowledge", tags=["Knowledge Base"])
app.include_router(custom_agent_routes.router, tags=["Custom Agents"])
app.include_router(phone_number_routes.router)  # Register phone number router
app.include_router(integration_routes.router)  # Register integrations router
app.include_router(pricing_routes.router)  # Register pricing router
app.include_router(user_routes.router)  # Register user router


@app.get("/", tags=["Health"])
def root():
    """API health check"""
    return {
        "status": "online",
        "service": "AI Voice Agent API",
        "version": "1.0.0"
    }


@app.on_event("startup")
async def startup_event():
    """Application startup"""
    logger.info("=" * 60)
    logger.info("🚀 AI Voice Agent API Started")
    logger.info("=" * 60)
    
    # Initialize Twilio outbound service
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_NUMBER")
    ngrok_domain = os.getenv("NGROK_DOMAIN")
    
    if account_sid and auth_token and from_number and ngrok_domain:
        webhook_base = f"https://{ngrok_domain}"
        outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base)
        logger.info("✅ Twilio outbound service initialized")
    else:
        logger.warning("⚠️ Twilio credentials not found, outbound calling will not work")
    
    # Start the callback scheduler
    asyncio.create_task(callback_scheduler._run_scheduler())
    
    # Warmup: Pre-load embedding model in background to avoid delays during calls
    async def warmup_models():
        try:
            logger.info("🔥 Warming up embedding model...")
            from app.services.retriever_service import _get_embedding_model
            _get_embedding_model()
            logger.info("✅ Embedding model warmed up")
        except Exception as e:
            logger.warning(f"⚠️ Model warmup failed (non-critical): {e}")
    
    asyncio.create_task(warmup_models())


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown"""
    logger.info("=" * 60)
    logger.info("🛑 AI Voice Agent API Stopped")
    logger.info("=" * 60)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEV", "false").lower() == "true"
    )