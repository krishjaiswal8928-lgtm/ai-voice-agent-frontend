#!/bin/bash
# run.sh

echo "Starting AI Voice Agent Platform..."

# Start Redis (if not already running)
# redis-server &

# Start Celery worker
# celery -A app.core.scheduler.celery_app worker --loglevel=info &

# Start Celery beat
# celery -A app.core.scheduler.celery_app beat --loglevel=info &

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload