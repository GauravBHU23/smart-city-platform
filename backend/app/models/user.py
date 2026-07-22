from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)

    # CITIZEN | OFFICER | ADMIN
    role = Column(String, nullable=False, default="CITIZEN")

    # Password-reset OTP (hashed) and its expiry.
    reset_otp_hash = Column(String, nullable=True)
    reset_otp_expires = Column(DateTime(timezone=True), nullable=True)

    # Expo push notification token for this user's device.
    push_token = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
