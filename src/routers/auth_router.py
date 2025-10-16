from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from src.db.database import get_db
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.models.db_models import User
from src.schemas.pydantic_schemas import UsuarioLoginSchema, TokenData
from src.core.security import verify_password, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_SECONDS

auth_router = APIRouter(tags=['Auth'])

security = HTTPBearer()

@auth_router.post("/api/auth/login", response_model=TokenData, status_code=status.HTTP_200_OK)
async def login_user(user: UsuarioLoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas.")
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_SECONDS)
    access_token_data = {
        'sub': str(db_user.id),
        'exp': datetime.now(timezone.utc) + expires_delta
    }
    return {
        'access_token': jwt.encode(access_token_data, SECRET_KEY, algorithm=ALGORITHM),
        'token_type': 'bearer',
        'expires_in': ACCESS_TOKEN_EXPIRE_SECONDS
    }


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Credenciales de autenticación inválidas.',
                headers={'WWW-Authenticate': 'Bearer'})

        db_user = db.query(User).filter(User.id == user_id).first()
        return db_user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Credenciales de autenticación inválidas.',
            headers={'WWW-Authenticate': 'Bearer'})
