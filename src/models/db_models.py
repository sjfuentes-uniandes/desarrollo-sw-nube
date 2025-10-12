import enum

from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint, Enum, ForeignKey
from src.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint('email', name='uq_users_email'),)

class VideoStatus(enum.Enum):
    processed = 'processed'
    uploaded = 'uploaded'

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(Enum(VideoStatus), default=VideoStatus.processed)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())
    processed_at = Column(DateTime, nullable=True)
    original_url = Column(String(255), nullable=True)
    processed_url = Column(String(255), nullable=True)

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    processed_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint('video_id', 'user_id'),)