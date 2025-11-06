"""
Tareas asíncronas de procesamiento de videos con Celery
"""
import os
import subprocess
import tempfile
import boto3
from datetime import datetime
from celery import Task
from src.core.celery_app import celery_app
from src.db.database import SessionLocal
from src.models.db_models import Video, VideoStatus

# Cliente S3
s3_client = boto3.client('s3')
try:
    from src.core.aws_config import S3_BUCKET_NAME, AWS_ACCOUNT_ID
    S3_BUCKET = S3_BUCKET_NAME
    BUCKET_OWNER = AWS_ACCOUNT_ID
except ImportError:
    S3_BUCKET = os.getenv('S3_BUCKET_NAME')
    BUCKET_OWNER = os.getenv('AWS_ACCOUNT_ID')


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
        
        # Descargar archivo de S3 a archivo temporal
        input_s3_key = video.original_url
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_input:
            try:
                extra_args = {}
                if BUCKET_OWNER:
                    extra_args['ExpectedBucketOwner'] = BUCKET_OWNER
                s3_client.download_fileobj(S3_BUCKET, input_s3_key, temp_input, ExtraArgs=extra_args)
                input_path = temp_input.name
            except Exception as e:
                return {"success": False, "error": f"Error descargando de S3: {str(e)}"}
        
        # Crear archivo temporal para salida
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        output_path = temp_output.name
        temp_output.close()
        
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
        
        # PASO 2: Subir archivo procesado a S3
        processed_s3_key = f"processed/processed_{os.path.basename(input_s3_key)}"
        
        with open(output_path, 'rb') as f:
            extra_args = {}
            if BUCKET_OWNER:
                extra_args['ExpectedBucketOwner'] = BUCKET_OWNER
            s3_client.upload_fileobj(f, S3_BUCKET, processed_s3_key, ExtraArgs=extra_args)
        
        # PASO 3: Actualizar BD
        video.status = VideoStatus.processed
        video.processed_url = processed_s3_key
        video.processed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(video)
        db.close()
        
        # Limpiar archivos temporales
        try:
            os.unlink(input_path)
            os.unlink(output_path)
        except:
            pass
        
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
