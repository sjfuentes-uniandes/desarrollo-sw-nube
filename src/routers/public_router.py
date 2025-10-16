from fastapi import APIRouter, status, HTTPException, UploadFile, File, Form, Query
from fastapi.params import Depends
import os
import shutil
from pathlib import Path
from datetime import datetime

from src.models.db_models import User, Video, Vote, VideoStatus
from src.routers.auth_router import verify_token
from src.schemas.pydantic_schemas import PublicVideoItem, RankingResponse
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func
from src.db.database import get_db
from src.models.db_models import User
from src.tasks.video_tasks import process_video_task
from typing import List, Optional


public_router = APIRouter(tags=["Public"])

# Endpoint GET - Listar los videos públicos
@public_router.get("/api/public/videos", response_model=List[PublicVideoItem],status_code=status.HTTP_200_OK)
def list_public_videos(
    db: Session = Depends(get_db)
):
    try:
        videos = (
            db.query(Video)
                    .filter(Video.status == VideoStatus.public)
                    .order_by(Video.uploaded_at.desc())
                    .all()
        )

        # Consulta de los datos del propietario del video
        user_ids = list({v.user_id for v in videos})
        users = db.query(User.id, User.first_name, User.city).filter(User.id.in_(user_ids)).all()
        users_map = {u.id: {"first_name": u.first_name, "city": u.city} for u in users}
        
        public_videos =[]

        for video in videos:
            owner = users_map.get(video.user_id, {})

            video_with_info = {
                "id": video.id,
                "title": video.title,
                "uploaded_at": getattr(video, "uploaded_at", None),
                "processed_url": getattr(video, "processed_url", None),
                "owner_name": owner.get("first_name"),
                "owner_city": owner.get("city"),
            }
            public_videos.append(video_with_info)

        return public_videos
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de videos públicos: {str(e)}"
        )

@public_router.get("/api/public/rankings", response_model=List[RankingResponse], status_code=status.HTTP_200_OK)
async def get_rankings(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    city: Optional[str] = Query(None, description="Filtrar por ciudad"),
    db: Session = Depends(get_db)
):
    try:
        # Query base: usuarios con sus votos totales
        query = db.query(
            User.id,
            User.first_name,
            User.last_name,
            User.city,
            func.coalesce(func.count(Vote.id), 0).label('votes')
        ).outerjoin(Video, User.id == Video.user_id)\
         .outerjoin(Vote, Video.id == Vote.video_id)\
         .group_by(User.id, User.first_name, User.last_name, User.city)
        
        # Aplicar filtro por ciudad si se proporciona
        if city:
            query = query.filter(User.city.ilike(f"%{city}%"))
        
        # Ordenar por votos descendente
        query = query.order_by(func.count(Vote.id).desc())
        
        # Aplicar paginación
        offset = (page - 1) * limit
        results = query.offset(offset).limit(limit).all()
        
        # Construir respuesta con posiciones
        rankings = []
        for index, result in enumerate(results):
            username = f"{result.first_name} {result.last_name}"
            position = offset + index + 1
            
            rankings.append(RankingResponse(
                position=position,
                username=username,
                city=result.city or "",
                votes=result.votes
            ))
        
        return rankings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Parámetro inválido en la consulta: {str(e)}"
        )
