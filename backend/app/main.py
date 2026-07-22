import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app.models import complaint as complaint_model  # noqa: F401 (registers table)
from app.models import user as user_model  # noqa: F401  (registers table)
from app.routers import analytics, auth, complaints, uploads, users

app = FastAPI(
    title="Smart City API",
    version="1.0.0",
)

# Create database tables if they don't exist yet.
# (Fine for development. For production we'll switch to Alembic migrations.)
Base.metadata.create_all(bind=engine)

# Allow the mobile app and admin panel (running on other origins) to call the API.
# CORS_ORIGINS is "*" in dev; set it to your admin panel URL(s) in production.
_origins = ["*"] if CORS_ORIGINS.strip() == "*" else [
    o.strip() for o in CORS_ORIGINS.split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded image files at /files/<filename>.
# (Mounted at /files, not /uploads, so it doesn't shadow the POST /uploads/image API.)
os.makedirs("uploads", exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(uploads.router)
app.include_router(analytics.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {
        "message": "Smart City API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected"
        }

    except Exception as e:
        return {
            "database": "connection failed",
            "error": str(e),
        }
