"""
Celery Worker for Background Tasks
"""

import os
from celery import Celery
from app.config import settings

# Create Celery instance
celery_app = Celery("ai_voice_agent")

# Configure Celery
celery_app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Auto-discover tasks
celery_app.autodiscover_tasks([
    "app.tasks",
])

if __name__ == "__main__":
    celery_app.start()