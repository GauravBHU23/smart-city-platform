"""
Create an ADMIN user. Run once:  python create_admin.py
Change the email/password below before running in a real setup.
"""

from app.core.security import hash_password
from app.database import SessionLocal, Base, engine
from app.models import complaint as _c  # noqa: F401
from app.models.user import User

Base.metadata.create_all(bind=engine)

ADMIN_EMAIL = "admin@city.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "City Admin"


def main():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            existing.role = "ADMIN"
            db.commit()
            print(f"User {ADMIN_EMAIL} already existed -> promoted to ADMIN.")
            return

        admin = User(
            full_name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        print(f"Admin created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
