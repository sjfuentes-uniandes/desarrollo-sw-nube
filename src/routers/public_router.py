from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from src.db.database import get_db
from src.models.db_models import User, Video, Vote
from src.schemas.pydantic_schemas import RankingResponse

public_router = APIRouter(tags=["Public"])

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