from fastapi import FastAPI
from src.db.database import engine
from src.models import db_models
from src.routers.usuario_router import user_router
from src.routers.auth_router import auth_router

db_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def read_root():
    return "Healthcheck"

app.include_router(router=user_router)
app.include_router(router=auth_router)
