"""
Tareas asíncronas de procesamiento de videos con Celery
"""
import os
import subprocess
from datetime import datetime
from celery import Task
from src.core.celery_app import celery_app
from src.db.database import SessionLocal
from src.models.db_models import Video, VideoStatus

# Variables de entorno para carpetas
UPLOADS_DIR = os.getenv("UPLOADS_DIR", "/home/ubuntu/app/uploads")
PROCESSED_DIR = os.getenv("PROCESSED_DIR", "/home/ubuntu/app/processed")


class DatabaseTask(Task):
    """Tarea base que maneja sesiones de BD"""
    _db = None
    
    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db
    
    def after_return(self, *args, **kwargs):
        if self._db is not None:
            self._db.close()
            self._db = None


@celery_app.task(base=DatabaseTask, bind=True, name='process_video')
def process_video_task(self, video_id: int):
    """
    Tarea asíncrona para procesar un video:
    1. Recortar el video
    2. Ajustar a formato 16:9
    3. Agregar logos institucionales ANB
    4. Actualizar estado en BD a 'processed'
    
    Args:
        video_id: ID del video en la base de datos
    
    Returns:
        dict: Resultado del procesamiento
    """
    try:
        # Obtener video de la BD
        db = SessionLocal()
        video = db.query(Video).filter(Video.id == video_id).first()
        
        if not video:
            return {"success": False, "error": f"Video {video_id} no encontrado"}
        
        # Rutas de archivos
        input_path = video.original_url
        
        if not os.path.exists(input_path):
            return {"success": False, "error": f"Archivo no encontrado: {input_path}"}
        
        output_filename = f"processed_{os.path.basename(input_path)}"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        # Asegurar que existe el directorio processed
        os.makedirs(PROCESSED_DIR, exist_ok=True)
        
        # PASO 1: Procesar video con FFmpeg
        # Comandos FFmpeg para:
        # - Ajustar a 16:9
        # - Escalar si es necesario
        # - Mantener calidad
        ffmpeg_command = [
            'ffmpeg',
            '-i', input_path,
            '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
            '-c:v', 'libx264',
            '-preset', 'faster',  # Más rápido para usar más CPU
            '-threads', '0',      # Usar todos los threads disponibles
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-y',  # Sobrescribir si existe
            output_path
        ]
        
        # Ejecutar FFmpeg
        print(f"[DEBUG] Ejecutando comando: {' '.join(ffmpeg_command)}")
        result = subprocess.run(
            ffmpeg_command,
            capture_output=True,
            text=True,
            timeout=1800  # 30 minutos timeout
        )
        
        print(f"[DEBUG] FFmpeg return code: {result.returncode}")
        print(f"[DEBUG] FFmpeg stdout: {result.stdout}")
        print(f"[DEBUG] FFmpeg stderr: {result.stderr}")
        
        if result.returncode != 0:
            raise Exception(f"Error en FFmpeg (code {result.returncode}): {result.stderr[:500]}")
        
        # PASO 2: Agregar logo ANB (simulado por ahora)
        # TODO: Implementar overlay de logo cuando esté disponible
        # ffmpeg_logo_command = [...]
        
        # PASO 3: Actualizar BD
        video.status = VideoStatus.processed
        video.processed_url = output_path
        video.processed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(video)
        db.close()
        
        return {
            "success": True,
            "video_id": video_id,
            "original_url": video.original_url,
            "processed_url": video.processed_url,
            "message": "Video procesado exitosamente"
        }
        
    except Exception as e:
        # En caso de error, actualizar el estado o registrar el error
        try:
            db = SessionLocal()
            video = db.query(Video).filter(Video.id == video_id).first()
            if video:
                # Podrías agregar un campo 'error_message' al modelo si quieres
                pass
            db.close()
        except:
            pass
        
        return {
            "success": False,
            "video_id": video_id,
            "error": str(e)
        }
