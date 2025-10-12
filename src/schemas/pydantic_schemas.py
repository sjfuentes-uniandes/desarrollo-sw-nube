from typing import Optional
from pydantic import BaseModel, Field, EmailStr

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