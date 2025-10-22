from fastapi import APIRouter, status, HTTPException, UploadFile, File, Form
from fastapi.params import Depends
import os
import shutil
import aiofiles
import aiofiles.os
from pathlib import Path
from datetime import datetime

from src.models.db_models import Video, Vote, VideoStatus
from src.routers.auth_router import verify_token
from src.schemas.pydantic_schemas import VideoResponse, VideoUploadResponse, VideoListItem
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.models.db_models import User
from src.tasks.video_tasks import process_video_task
from typing import List



video_router = APIRouter(tags=["Videos"])

# Configuración de directorios
UPLOAD_DIR = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))
UPLOAD_DIR.mkdir(exist_ok=True)

# Constantes
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB en bytes
ALLOWED_CONTENT_TYPES = ["video/mp4"]


@video_router.post("/api/videos/upload", response_model=VideoUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    video_file: UploadFile = File(..., description="Archivo de video en formato MP4, máximo 100MB"),
    title: str = Form(..., description="Título descriptivo del video"),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """
    Permite a un jugador subir un video de habilidades.
        
    El video inicia con estado 'uploaded' y pasa a 'processed' al completar el procesamiento.
    
    **Parámetros (form-data):**
    - video_file: Archivo de video en formato MP4, máximo 100MB
    - title: Título descriptivo del video
    
    **Respuesta:**
    ```json
    {
        "message": "Video subido exitosamente. Tarea creada.",
        "task_id": "123456"
    }
    ```
    """
    try:
        # VALIDACIÓN 1: Verificar tipo de archivo
        if video_file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error en el archivo (tipo o tamaño no valido): {video_file.content_type}"
            )
        
        # VALIDACIÓN 2: Verificar tamaño del archivo
        # Leer el contenido para verificar el tamaño
        file_content = await video_file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo excede el tamaño máximo permitido de 100MB. Tamaño: {file_size / 1024 / 1024:.2f}MB"
            )
        
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo está vacío"
            )
        
        # PASO 1: Generar nombre único para el archivo
        timestamp = int(datetime.now().timestamp())
        file_extension = Path(video_file.filename).suffix
        unique_filename = f"user_{current_user.id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # PASO 2: Guardar el archivo en el sistema de archivos
        async with aiofiles.open(file_path, "wb") as buffer:
            await buffer.write(file_content)
        
        # PASO 3: Crear registro en la base de datos con estado 'uploaded'
        new_video = Video(
            title=title,
            status=VideoStatus.uploaded,
            user_id=current_user.id,
            original_url=str(file_path),
            processed_url=None,
            processed_at=None,
            task_id=None  # Se asignará después de encolar la tarea
        )
        
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        # PASO 4: Encolar tarea de procesamiento asíncrono en Celery
        # La tarea se ejecuta en segundo plano por workers de Celery
        task = process_video_task.delay(new_video.id)
        
        # PASO 5: Actualizar el video con el task_id
        new_video.task_id = task.id
        db.commit()
        
        # PASO 6: Responder inmediatamente al cliente (sin esperar al procesamiento)
        return VideoUploadResponse(
            message="Video subido exitosamente. Tarea creada.",
            task_id=task.id
        )
        
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        # Limpiar el archivo si algo sale mal
        if 'file_path' in locals() and file_path.exists():
            await aiofiles.os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir el video: {str(e)}"
        )


@video_router.get("/api/videos", response_model=List[VideoListItem], status_code=status.HTTP_200_OK)
async def list_user_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """
    Lista todos los videos subidos por el usuario autenticado.
    
    Muestra el estado de cada video (uploaded o processed) junto con sus datos.
            
    **Códigos de respuesta:**
    - 200: Lista de videos obtenida
    - 401: Falta de autenticación
    """
    try:
        # Obtener todos los videos del usuario autenticado
        videos = db.query(Video).filter(Video.user_id == current_user.id).order_by(Video.uploaded_at.desc()).all()
        
        return videos
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de videos: {str(e)}"
        )


@video_router.get("/api/videos/{video_id}",response_model= VideoResponse, status_code=status.HTTP_200_OK)
async def get_video(video_id: int,db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    exist_video = db.query(Video).filter(Video.id == video_id).first()
    if not exist_video:
        raise HTTPException(status_code=404, detail="Video not found")

    if exist_video.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized")

    votes_data = get_votes_by_video_id(video_id, db)
    combined_data = {
        **exist_video.__dict__,
        "votes": votes_data["votes_count"]
    }

    video_response = VideoResponse.model_validate(combined_data)

    return video_response

@video_router.delete('/api/videos/{video_id}',response_model=dict, status_code=status.HTTP_200_OK)
async def delete_video(video_id:int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    exist_video = db.query(Video).filter(Video.id == video_id).first()
    if not exist_video:
        raise HTTPException(status_code=404, detail="Video not found")
    if exist_video.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized")

    if exist_video.status == VideoStatus.public:
        raise HTTPException(status_code=400, detail="Video is public")

    # Eliminar archivos físicos
    files_to_delete = []
    if exist_video.original_url:
        files_to_delete.append(exist_video.original_url)
    if exist_video.processed_url:
        files_to_delete.append(exist_video.processed_url)
    
    # Eliminar de la base de datos primero
    db.delete(exist_video)
    db.commit()
    
    # Eliminar archivos físicos después del commit
    for file_path in files_to_delete:
        try:
            if os.path.exists(file_path):
                await aiofiles.os.remove(file_path)
        except Exception as e:
            # Log error pero no fallar la operación
            print(f"Error eliminando archivo {file_path}: {e}")
    
    return {
        'message': 'El video ha sido eliminado exitosamente.',
        'video_id': video_id
    }



def get_votes_by_video_id(video_id: int, db: Session):
    exist_video = db.query(Video).filter(Video.id == video_id).first()
    if not exist_video:
        raise HTTPException(status_code=404, detail="Video not found")
    votes_count = db.query(Vote).filter(Vote.video_id == video_id).count()

    return {"video_id": video_id, "votes_count": votes_count}
