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
    # Usar la cola SQS existente
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        SQS_BROKER_URL = f"sqs://"
        SQS_BACKEND_URL = f"rpc://"
    else:
        SQS_BROKER_URL = "memory://"
        SQS_BACKEND_URL = "cache+memory://"
        queue_name = "video-processing"
except ImportError:
    # Fallback a SQS con variables de entorno
    SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
    if SQS_QUEUE_URL:
        queue_name = SQS_QUEUE_URL.split('/')[-1]
        SQS_BROKER_URL = f"sqs://"
        SQS_BACKEND_URL = f"rpc://"
    else:
        # Solo como último recurso para desarrollo
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
        'queue_name_prefix': '',  # Sin prefijo
        'predefined_queues': {
            queue_name: {
                'url': SQS_QUEUE_URL if 'SQS_QUEUE_URL' in globals() else None
            }
        }
    },
    broker_url=SQS_BROKER_URL,
    task_default_queue=queue_name,
    task_routes={
        'src.tasks.video_tasks.process_video_task': {'queue': queue_name}
    }
)
