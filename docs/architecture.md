# ⚙️ System Architecture

## Flow Diagram

Audio Input 🎤 → [STT Service] → [LLM Service] → [TTS Service] → Audio Output 🔊

## Modules
| Layer | Purpose |
|-------|----------|
| app/services | Handles STT, LLM, TTS, Twilio |
| app/agent | Manages state, goals, orchestration |
| app/routes | FastAPI endpoints |
| app/database | ORM and data persistence |
| app/models | Schema for clients, goals, conversations |

## Future Integration
- RAG-based real-time contextual memory  
- Streaming API for live LLM + TTS  
- Scalable microservices via Kubernetes
