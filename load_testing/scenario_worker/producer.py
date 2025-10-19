import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

import argparse
import os
import uuid
from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from src.models.db_models import Video, VideoStatus

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/desarrollo_sw_nube")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

celery_app = Celery(
    "video_processing",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)


def create_and_publish_tasks(task_count: int, video_name: str, user_id: int):
    """
    Crea registros de video en la BD y luego publica las tareas de procesamiento.
    """
    db = SessionLocal()
    print(f"🚀 Creando {task_count} registros y encolando tareas para el video: '{video_name}'...")

    path_inside_container = f'/app/uploads/{video_name}'

    try:
        for i in range(task_count):
            new_video = Video(
                title=f"Test Video {uuid.uuid4()}",
                status=VideoStatus.uploaded,
                user_id=user_id,
                original_url=path_inside_container,
                processed_url=None,
                processed_at=None,
                task_id=None
            )

            db.add(new_video)
            db.commit()
            db.refresh(new_video)

            video_id = new_video.id

            task_name = 'process_video'

            celery_app.send_task(
                task_name,
                args=[video_id]
            )
            print(f"  [✅] Video #{video_id} creado y tarea encolada.")

    finally:
        db.close()

    print("\n Todas las tareas han sido encoladas exitosamente.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Productor de tareas de procesamiento para Celery.")
    parser.add_argument("count", type=int, help="Número de tareas a generar.")
    parser.add_argument("video", type=str, help="Nombre del archivo en /uploads (ej. video_50mb.mp4).")
    parser.add_argument("--user", type=int, default=1, help="ID del usuario de prueba para asociar los videos.")

    args = parser.parse_args()

    create_and_publish_tasks(
        task_count=args.count,
        video_name=args.video,
        user_id=args.user
    )