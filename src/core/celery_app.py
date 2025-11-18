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
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        BROKER_URL = f"sqs://"
        BACKEND_URL = f"rpc://"
    else:
        raise ValueError("SQS_QUEUE_URL no configurada")
except (ImportError, ValueError):
    SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        BROKER_URL = f"sqs://"
        BACKEND_URL = f"rpc://"
    else:
        raise ValueError("SQS_QUEUE_URL debe estar configurada")

# Crear instancia de Celery
celery_app = Celery(
    "video_processing",
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=['src.tasks.video_tasks']
)

# Configuración de Celery para SQS
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Bogota',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    result_expires=3600,
    
    # Configuración crítica para SQS
    broker_transport_options={
        'region': AWS_REGION if 'AWS_REGION' in locals() else 'us-east-1',
        'visibility_timeout': 3600,
        'polling_interval': 1,
        'wait_time_seconds': 20,
        'predefined_queues': {
            queue_name: {
                'url': SQS_QUEUE_URL if 'SQS_QUEUE_URL' in locals() else None
            }
        }
    },
    
    # Forzar uso de cola específica
    task_default_queue=queue_name,
    task_create_missing_queues=False,
    task_ignore_result=True,  # Evita problemas con backend
    
    # Rutas de tareas
    task_routes={
        'src.tasks.video_tasks.process_video_task': {'queue': queue_name},
        'process_video': {'queue': queue_name}
    }
)

# Exportar queue_name para uso en otros módulos
__all__ = ['celery_app', 'queue_name']
