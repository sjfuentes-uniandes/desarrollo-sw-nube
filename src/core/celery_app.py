"""
Configuración de Celery para procesamiento asíncrono de videos
"""
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Configuración de Redis como broker
try:
    from src.core.aws_config import REDIS_URL
except ImportError:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Crear instancia de Celery
celery_app = Celery(
    "video_processing",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['src.tasks.video_tasks']
)

# Configuración adicional
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Bogota',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutos máximo por tarea
    result_expires=3600,  # Los resultados expiran en 1 hora
)
