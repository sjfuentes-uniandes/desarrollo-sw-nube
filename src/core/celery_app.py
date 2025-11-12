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
    # Construir URL de SQS para Celery
    queue_name = SQS_QUEUE_URL.split('/')[-1]
    SQS_BROKER_URL = f"sqs://"
    SQS_BACKEND_URL = f"rpc://"
except ImportError:
    # Fallback a Redis para desarrollo local
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SQS_BROKER_URL = REDIS_URL
    SQS_BACKEND_URL = REDIS_URL

# Crear instancia de Celery
celery_app = Celery(
    "video_processing",
    broker=SQS_BROKER_URL,
    backend=SQS_BACKEND_URL,
    include=['src.tasks.video_tasks']
)

# Configuración adicional para SQS
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Bogota',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutos máximo por tarea
    result_expires=3600,  # Los resultados expiran en 1 hora
    
    # Configuración específica para SQS
    broker_transport_options={
        'region': AWS_REGION if 'AWS_REGION' in globals() else 'us-east-1',
        'visibility_timeout': 3600,  # 1 hora para procesar
        'polling_interval': 1,  # Polling cada segundo
        'wait_time_seconds': 20,  # Long polling
    },
    task_default_queue=queue_name if 'queue_name' in locals() else 'video-processing',
    task_routes={
        'src.tasks.video_tasks.process_video_task': {'queue': queue_name if 'queue_name' in locals() else 'video-processing'}
    }
)
