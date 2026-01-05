from celery import Celery
import os

# Celery configuration
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "ai_voice_agent",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.lead_caller_job",
        "app.tasks.rag_indexer",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Scheduler configuration
celery_app.conf.beat_schedule = {
    "process-outbound-campaigns": {
        "task": "app.tasks.lead_caller_job.process_outbound_campaigns",
        "schedule": 60.0,  # Every minute
    },
}