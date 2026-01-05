# AI Voice Agent SaaS Platform

An enterprise-grade AI voice agent platform that enables businesses to automate customer interactions through intelligent voice conversations. Built with Python, FastAPI, Next.js, and Twilio.

## Features

- **Outbound Campaigns**: Auto-dial leads, collect data, and upsell products
- **Inbound Campaigns**: Answer incoming calls with AI agents trained on your knowledge base
- **RAG Training**: Upload PDFs, DOCX, URLs - AI remembers content for contextual responses
- **Goal-Based AI**: Agents follow user-defined goals (e.g., "Book a demo")
- **Live Dashboard**: Real-time call status, transcripts, and agent responses
- **CSV Export**: Export results after outbound campaigns
- **Campaign History**: View past campaigns and download results
- **Responsive UI**: Mobile and desktop friendly interface
- **SEO-Friendly**: Next.js SSR with sitemap and metadata

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Relational database
- **Redis**: In-memory data store for caching and task queue
- **Celery**: Distributed task queue
- **Twilio**: Voice and SMS communication
- **Google Gemini**: Large language model
- **AWS Polly**: Text-to-speech service
- **Deepgram**: Speech-to-text service
- **FAISS/Pinecone**: Vector databases for RAG

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: UI component library
- **Tailwind CSS**: Utility-first CSS framework

## Architecture

```
graph TB
    A[Next.js Frontend] --> B[FastAPI Backend]
    B --> C[PostgreSQL]
    B --> D[Redis]
    B --> E[Celery Workers]
    B --> F[Twilio API]
    B --> G[Google Gemini]
    B --> H[AWS Polly]
    B --> I[Deepgram]
    B --> J[FAISS/Pinecone]
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL
- Redis
- Twilio account
- Google Cloud account
- AWS account
- Deepgram account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-voice-agent
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. Run the application:
```bash
# Terminal 1: Start backend
uvicorn main:app --reload

# Terminal 2: Start Celery worker
celery -A app.core.scheduler.celery_app worker --loglevel=info

# Terminal 3: Start Celery beat
celery -A app.core.scheduler.celery_app beat --loglevel=info

# Terminal 4: Start frontend
cd frontend
npm run dev
```

### Using Docker

```bash
docker-compose up --build
```

## Project Structure

```
ai_voice_agent/
├── .env                        # All secrets
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json                # Monorepo
├── turbo.json                  # Optional
├── README.md

├── backend/                    # FastAPI (Python)
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── core/
│   │   ├── logging.py
│   │   ├── security.py         # JWT Auth
│   │   ├── scheduler.py        # Outbound dialer
│   │   └── utils.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── campaign_routes.py  # CRUD, start/stop
│   │   ├── rag_routes.py       # Upload PDFs/URLs
│   │   ├── lead_routes.py      # CSV upload
│   │   ├── voice_routes.py     # Twilio webhook
│   │   └── report_routes.py    # CSV export
│   ├── models/
│   │   ├── user.py
│   │   ├── campaign.py
│   │   ├── lead.py
│   │   ├── conversation.py
│   │   ├── goal.py
│   │   └── rag_document.py
│   ├── schemas/                # Pydantic
│   ├── services/
│   │   ├── rag_service.py      # Parse PDF/DOCX, scrape URLs, embeddings
│   │   ├── campaign_service.py
│   │   ├── lead_caller.py      # Auto-dial next lead
│   │   ├── llm_service.py      # Gemini + RAG
│   │   ├── stt_service.py      # Deepgram
│   │   ├── tts_service.py      # AWS Polly
│   │   ├── twilio_service.py
│   │   └── excel_exporter.py   # CSV
│   ├── agent/
│   │   ├── state_manager.py
│   │   ├── memory_store.py     # + RAG context
│   │   └── orchestrator.py     # STT → LLM(RAG) → TTS
│   ├── database/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── vector_store.py     # FAISS / Pinecone
│   ├── tasks/
│   │   ├── lead_caller_job.py
│   │   └── rag_indexer.py
│   └── tests/

├── frontend/                   # Next.js + TypeScript + MUI
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # DashboardScreen
│   │   │   ├── auth/login/page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx                # CampaignTypeSelectScreen
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── outbound/[id]/page.tsx  # OutboundCallingLiveScreen
│   │   │   │   └── inbound/[id]/page.tsx   # InboundLiveCallDashboardScreen
│   │   │   └── history/page.tsx
│   │   ├── components/
│   │   │   ├── CampaignForm.tsx
│   │   │   ├── RAGUploadZone.tsx
│   │   │   ├── LeadCSVUploader.tsx
│   │   │   ├── ActiveCallCard.tsx
│   │   │   └── TranscriptViewer.tsx
│   │   ├── lib/api.ts
│   │   ├── hooks/useCampaigns.ts
│   │   └── types/

├── data/
│   ├── rag_uploads/
│   ├── summaries/          # CSV exports
│   └── recordings/

├── docs/
│   └── ui_flow.md

└── infra/docker/
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token

### Campaigns
- `GET /campaigns` - List all campaigns
- `GET /campaigns/{id}` - Get campaign details
- `POST /campaigns` - Create new campaign
- `PUT /campaigns/{id}` - Update campaign
- `DELETE /campaigns/{id}` - Delete campaign
- `POST /campaigns/{id}/start` - Start campaign
- `POST /campaigns/{id}/stop` - Stop campaign

### RAG Documents
- `POST /rag/upload-pdf/{campaign_id}` - Upload PDF
- `POST /rag/upload-docx/{campaign_id}` - Upload DOCX
- `POST /rag/upload-url/{campaign_id}` - Upload URL content
- `GET /rag/documents/{campaign_id}` - List RAG documents

### Leads
- `POST /leads/upload-csv/{campaign_id}` - Upload leads CSV
- `GET /leads/{campaign_id}` - List leads for campaign
- `GET /leads/{id}` - Get lead details

### Voice
- `GET /voice/active-calls` - Get active calls
- `GET /voice/call/{call_sid}` - Get call details
- `POST /voice/call/{call_sid}/end` - End call manually
- `POST /voice/webhook` - Twilio webhook
- `GET /voice/health` - Health check

### Reports
- `GET /reports/export-campaign/{campaign_id}` - Export campaign results
- `GET /reports/export-conversations/{campaign_id}` - Export conversations
- `GET /reports` - List reports

## Development

### Backend Development
1. Set up virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run development server:
```bash
uvicorn main:app --reload
```

### Frontend Development
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

### Running Both Servers on Port 8000

To run both servers on localhost:8000:

1. Make sure you have all dependencies installed:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install
   ```

2. Run both servers using one of the provided scripts:

   For Windows Command Prompt:
   ```bash
   run_servers.bat
   ```

   For PowerShell:
   ```bash
   .\run_servers.ps1
   ```

   Or manually run each component:

   a. Start the Python backend server:
      ```bash
      python main.py
      ```

   b. In another terminal, start the frontend server:
      ```bash
      cd frontend
      npm run dev
      ```

   c. In a third terminal, start ngrok to expose port 8000:
      ```bash
      ngrok http 8000
      ```

3. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Ngrok tunnel: Check ngrok terminal output for the public URL

### Testing
```
# Run backend tests
pytest

# Run tests with coverage
pytest --cov=app

# Run frontend tests
cd frontend
npm test
```

## Deployment

### Using Docker
```bash
docker-compose up --build -d
```

### Manual Deployment
1. Build frontend:
```bash
cd frontend
npm run build
```

2. Start backend services:
```bash
# Start main application
uvicorn main:app --host 0.0.0.0 --port 8000

# Start Celery worker
celery -A app.core.scheduler.celery_app worker --loglevel=info

# Start Celery beat
celery -A app.core.scheduler.celery_app beat --loglevel=info
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or questions, please open an issue on GitHub.