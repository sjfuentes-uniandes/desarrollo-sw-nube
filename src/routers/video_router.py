from fastapi import APIRouter, status, HTTPException
from fastapi.params import Depends

from src.models.db_models import Video, Vote, VideoStatus
from src.routers.auth_router import verify_token
from src.schemas.pydantic_schemas import VideoResponse
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.models.db_models import User



video_router = APIRouter(tags=["Videos"])

@video_router.get("/api/videos/{video_id}",response_model= VideoResponse, status_code=status.HTTP_200_OK)
async def get_video(video_id: int,db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    try:
        exist_video = db.query(Video).filter(Video.id == video_id).first()
        if not exist_video:
            raise HTTPException(status_code=404, detail="Video not found")

        if exist_video.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You are not authorized")

        votes_data = get_votes_by_video_id(video_id,db)
        combined_data = {
            **exist_video.__dict__,
            "votes": votes_data["votes_count"]
        }

        video_response = VideoResponse.model_validate(combined_data)

        return video_response

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")




def get_votes_by_video_id(video_id: int, db: Session):
    exist_video = db.query(Video).filter(Video.id == video_id).first()
    if not exist_video:
        raise HTTPException(status_code=404, detail="Video not found")
    votes_count = db.query(Vote).filter(Vote.video_id == video_id).count()

    return {"video_id": video_id, "votes_count": votes_count}