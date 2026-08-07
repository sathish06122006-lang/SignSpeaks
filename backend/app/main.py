from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ensure_indexes
from app.routes import auth, detection, dashboard, tutorials, admin, dataset

app = FastAPI(
    title="Sign Speaks API",
    description="AI Indian Sign Language Detection & Learning Platform backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(detection.router)
app.include_router(dashboard.router)
app.include_router(tutorials.router)
app.include_router(admin.router)
app.include_router(dataset.router)


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "sign-speaks-api"}
