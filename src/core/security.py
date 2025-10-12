import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from passlib.hash import bcrypt_sha256, bcrypt

import jwt

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_SECONDS = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", "3600"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if bcrypt_sha256.identify(hashed_password):
        return bcrypt_sha256.verify(plain_password, hashed_password)
    if bcrypt.identify(hashed_password):
        return bcrypt.verify(plain_password, hashed_password)
    return False

def get_password_hash(password: str) -> str:
    return bcrypt.hash(password[:72])

def create_access_token(subject: str) -> tuple[str, int]:
    expires_delta = timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, ACCESS_TOKEN_EXPIRE_SECONDS
