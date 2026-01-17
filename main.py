import os
import logging
import asyncio
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Defer imports that might cause issues at startup
print("DEBUG: Importing auth_routes...", flush=True)
import app.routes.auth_routes as auth_routes
print("DEBUG: Importing campaign_routes...", flush=True)
import app.routes.campaign_routes as campaign_routes
print("DEBUG: Importing rag_routes...", flush=True)
import app.routes.rag_routes as rag_routes
print("DEBUG: Importing lead_routes...", flush=True)
import app.routes.lead_routes as lead_routes
print("DEBUG: Importing voice_routes...", flush=True)
import app.routes.voice_routes as voice_routes
print("DEBUG: Importing report_routes...", flush=True)
import app.routes.report_routes as report_routes
print("DEBUG: Importing twilio_routes...", flush=True)
import app.routes.twilio_routes as twilio_routes
print("DEBUG: Importing client_routes...", flush=True)
import app.routes.client_routes as client_routes
print("DEBUG: Importing knowledge_routes...", flush=True)
import app.routes.knowledge_routes as knowledge_routes
print("DEBUG: Importing custom_agent_routes...", flush=True)
import app.routes.custom_agent_routes as custom_agent_routes
print("DEBUG: Importing phone_number_routes...", flush=True)
import app.routes.phone_number_routes as phone_number_routes
print("DEBUG: Importing integration_routes...", flush=True)
import app.routes.integration_routes as integration_routes
print("DEBUG: Importing pricing_routes...", flush=True)
import app.routes.pricing_routes as pricing_routes
print("DEBUG: Importing user_routes...", flush=True)
import app.routes.user_routes as user_routes
print("DEBUG: Importing sip_trunk_routes...", flush=True)
import app.routes.sip_trunk_routes as sip_trunk_routes
print("DEBUG: Importing sip_webhook_routes...", flush=True)
import app.routes.sip_webhook_routes as sip_webhook_routes
print("DEBUG: Importing sip_call_routes...", flush=True)
import app.routes.sip_call_routes as sip_call_routes
print("DEBUG: Importing human_agent_routes...", flush=True)
import app.routes.human_agent_routes as human_agent_routes
print("DEBUG: Importing transfer_routes...", flush=True)
import app.routes.transfer_routes as transfer_routes
print("DEBUG: Importing callback_routes...", flush=True)
import app.routes.callback_routes as callback_routes
print("DEBUG: Importing analytics_routes...", flush=True)
import app.routes.analytics_routes as analytics_routes



print("DEBUG: Importing security...", flush=True)
from app.core import security
print("DEBUG: Importing callback_scheduler...", flush=True)
from app.services.callback_scheduler import callback_scheduler
print("DEBUG: Importing outbound_manager...", flush=True)
from app.services.outbound_service import outbound_manager
print("DEBUG: main.py imports finished...", flush=True)
import logging

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
    version="1.0.0",
    redirect_slashes=False  # Prevent automatic slash redirects
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://speaksynthai.com", "https://www.speaksynthai.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Add middleware to handle Railway's proxy headers
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class ProxyHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Trust Railway's proxy headers
        if "x-forwarded-proto" in request.headers:
            request.scope["scheme"] = request.headers["x-forwarded-proto"]
        response = await call_next(request)
        return response

app.add_middleware(ProxyHeadersMiddleware)

# Register routers
app.include_router(auth_routes.router)
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
app.include_router(sip_trunk_routes.router)  # Register SIP trunk router
app.include_router(sip_webhook_routes.router)  # Register SIP webhook router
app.include_router(sip_call_routes.router)  # Register SIP call router
app.include_router(human_agent_routes.router)  # Register human agents router
app.include_router(transfer_routes.router)  # Register transfers router
app.include_router(callback_routes.router)  # Register callbacks router
app.include_router(analytics_routes.router)  # Register analytics router




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
    ngrok_domain = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
    
    if account_sid and auth_token and from_number and ngrok_domain:
        webhook_base = f"https://{ngrok_domain}"
        outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base)
        logger.info("✅ Twilio outbound service initialized")
    else:
        logger.warning("⚠️ Twilio credentials not found, outbound calling will not work")
    
    # Start the callback scheduler
    # Note: Callback scheduler will be initialized on first use due to lazy loading
    # asyncio.create_task(callback_scheduler._run_scheduler())
    logger.info("✅ Callback scheduler configured (lazy initialization)")
    
    # Start SIP trunk monitoring
    logger.info("🔍 Starting SIP trunk monitoring...")
    from google.cloud import firestore
    from app.tasks.background_jobs import monitor_all_sip_trunks
    
    async def sip_monitoring_loop():
        """Run SIP monitoring every 60 seconds"""
        db = firestore.Client()
        while True:
            try:
                await monitor_all_sip_trunks(db)
            except Exception as e:
                logger.error(f"SIP monitoring error: {e}")
            await asyncio.sleep(60)  # Check every 60 seconds
    
    asyncio.create_task(sip_monitoring_loop())
    logger.info("✅ SIP trunk monitoring started")
    
    # Warmup: Pre-load embedding model in background to avoid delays during calls
    # Warmup: Pre-load embedding model - DISABLED for Render Free Tier to save RAM
    # async def warmup_models():
    #     try:
    #         logger.info("🔥 Warming up embedding model...")
    #         from app.services.retriever_service import _get_embedding_model
    #         # Run blocking model loading in a separate thread to avoid blocking the event loop
    #         await asyncio.to_thread(_get_embedding_model)
    #         logger.info("✅ Embedding model warmed up")
    #     except Exception as e:
    #         logger.warning(f"⚠️ Model warmup failed (non-critical): {e}")
    
    # Run warmup as a background task
    # asyncio.create_task(warmup_models())
    logger.info("ℹ️ Model warmup skipped to optimize memory usage")


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