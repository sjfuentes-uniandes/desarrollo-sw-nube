import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from src.models.db_models import VideoStatus


class BaseUser(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)

class UserCreateSchema(BaseUser):
    password1: str = Field(min_length=8)
    password2: str = Field(min_length=8)

class UsuarioLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class TokenData(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserSchema(BaseUser):
    id: int

class Config:
    orm_mode = True

# ---------------------------------------------------------------------
# Video schema
# ---------------------------------------------------------------------

class VideoResponse(BaseModel):
    video_id: int
    title: str
    status: VideoStatus
    uploaded_at: datetime
    processed_at: Optional[datetime] | None
    original_url: Optional[str] | None
    processed_url: Optional[str] | None
    votes: int

    class Config:
        from_attributes = True