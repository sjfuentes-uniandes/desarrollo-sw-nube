from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
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
    