import os

from dotenv import load_dotenv

load_dotenv()

# Central place for all app settings (read from .env).
DATABASE_URL = os.getenv("DATABASE_URL")

# Managed Postgres providers (Supabase/Neon/Render/Heroku) often hand out a URL
# beginning with "postgres://". SQLAlchemy's driver name is "postgresql://".
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Comma-separated list of allowed origins for CORS (the admin panel URL in prod).
# "*" is fine for development; set a real list in production.
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create backend/.env (copy .env.example) "
        "and set your PostgreSQL connection string."
    )
