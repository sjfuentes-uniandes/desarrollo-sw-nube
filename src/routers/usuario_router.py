from fastapi import APIRouter, Depends, HTTPException, status
from src.db.database import get_db
from sqlalchemy.orm import Session

from src.models.db_models import User
from src.schemas.pydantic_schemas import UserCreateSchema, UserSchema
from src.core.security import get_password_hash

user_router = APIRouter(tags=['Usuarios'])

@user_router.post("/api/auth/signup", response_model = UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreateSchema, db: Session = Depends(get_db)):
    if user.password1 != user.password2:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden.")
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email ya está registrado.")
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=get_password_hash(user.password1),
        city=user.city,
        country=user.country,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
