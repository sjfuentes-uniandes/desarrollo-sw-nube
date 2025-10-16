from fastapi import APIRouter, status, HTTPException, UploadFile, File, Form
from fastapi.params import Depends
import os
import shutil
from pathlib import Path
from datetime import datetime

from src.models.db_models import Video, Vote, VideoStatus
from src.routers.auth_router import verify_token
from src.schemas.pydantic_schemas import PublicVideoItem
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func
from src.db.database import get_db
from src.models.db_models import User
from src.tasks.video_tasks import process_video_task
from typing import List

public_router = APIRouter(tags=["Public"])

# Endpoint GET - Listar los videos públicos
@public_router.get("/api/public/videos", response_model=List[PublicVideoItem],status_code=status.HTTP_200_OK)
def list_public_videos(
    db: Session = Depends(get_db)
):
    try:
        # Se cuentan los votos en subconsulta
        subq_votes = (
            db.query(
                Vote.video_id.label("video_id"),
                func.count(Vote.id).label("votes")
            )
            .group_by(Vote.video_id)
            .subquery()
        )

        videos = (
            db.query(Video,
                     func.coalesce(subq_votes.c.votes, 0)
                     .label("votes")
                     )
                    .filter(Video.status == VideoStatus.public)
                    .order_by(Video.uploaded_at.desc())
                    .all()
        )
        public_videos =[]
        for video, votes in videos:
            video_with_info = {
                "id": video.id,
                "title": video.title,
                "uploaded_at": video.uploaded_at,
                "processed_url": video.processed_rul,
                "votes": int(votes),
                "owner_name": getattr(video, "owner", None) and getattr(video.owner, "first_name", None),
                "owner_city": getattr(video, "owner", None) and getattr(video.owner, "city", None),
            }
            public_videos.append(PublicVideoItem.model_validate(video_with_info))

        return public_videos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de videos públicos: {str(e)}"
        )
    
    
    
