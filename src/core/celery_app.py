"""
Configuración de Celery para procesamiento asíncrono de videos
"""
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Configuración de SQS como broker
try:
    from src.core.aws_config import SQS_QUEUE_URL, AWS_REGION, AWS_ACCOUNT_ID
    print(f"[DEBUG] SQS_QUEUE_URL: {SQS_QUEUE_URL}")
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        print(f"[DEBUG] queue_name: {queue_name}")
        SQS_BROKER_URL = f"sqs://"
        SQS_BACKEND_URL = f"rpc://"
    else:
        SQS_BROKER_URL = "memory://"
        SQS_BACKEND_URL = "cache+memory://"
        queue_name = "video-processing"
except ImportError as e:
    print(f"[DEBUG] ImportError: {e}")
    SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        SQS_BROKER_URL = f"sqs://"
        SQS_BACKEND_URL = f"rpc://"
    else:
        SQS_BROKER_URL = "memory://"
        SQS_BACKEND_URL = "cache+memory://"
        queue_name = "video-processing"

# Crear instancia de Celery
celery_app = Celery(
    "video_processing",
    broker=SQS_BROKER_URL,
    backend=SQS_BACKEND_URL,
    include=['src.tasks.video_tasks']
)

# Configuración adicional para SQS
print(f"[DEBUG] Final queue_name: {queue_name}")
print(f"[DEBUG] Final SQS_QUEUE_URL: {SQS_QUEUE_URL if 'SQS_QUEUE_URL' in locals() else 'Not defined'}")

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Bogota',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    result_expires=3600,
    
    broker_transport_options={
        'region': AWS_REGION if 'AWS_REGION' in locals() else 'us-east-1',
        'visibility_timeout': 3600,
        'polling_interval': 1,
        'wait_time_seconds': 20,
        'queue_name_prefix': '',
        'predefined_queues': {
            queue_name: {
                'url': SQS_QUEUE_URL if 'SQS_QUEUE_URL' in locals() and SQS_QUEUE_URL else None
            }
        }
    },
    task_default_queue=queue_name,
    task_routes={
        'src.tasks.video_tasks.process_video_task': {'queue': queue_name},
        'process_video': {'queue': queue_name}
    },
    task_create_missing_queues=False,
    worker_prefetch_multiplier=1,
    task_acks_late=True
)

# Exportar queue_name para uso en otros módulos
__all__ = ['celery_app', 'queue_name']
