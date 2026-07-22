from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.rate_limit import (
    check_login_allowed,
    record_failed_login,
    reset_login_attempts,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    PushTokenUpdate,
    ResetPasswordRequest,
    Token,
    UserLogin,
    UserOut,
    UserRegister,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role="CITIZEN",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Brute-force protection: block after repeated failures from same IP+email.
    check_login_allowed(request, payload.email)

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_login(request, payload.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    reset_login_attempts(request, payload.email)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------- Forgot / reset password (email OTP) ----------------

@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Send a 6-digit OTP to the user's email (valid 10 minutes)."""
    # Reuse the login rate limiter so OTP requests can't be spammed.
    check_login_allowed(request, f"otp:{payload.email}")
    record_failed_login(request, f"otp:{payload.email}")

    user = db.query(User).filter(User.email == payload.email).first()
    # Always return the same message so attackers can't probe which
    # emails are registered.
    generic = {"message": "If this email is registered, a reset code has been sent."}
    if not user:
        return generic

    import secrets
    from datetime import datetime, timedelta, timezone

    from app.core.emailer import send_otp_email

    otp = f"{secrets.randbelow(1000000):06d}"
    user.reset_otp_hash = hash_password(otp)
    user.reset_otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    send_otp_email(user.email, otp)
    return generic


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Verify the OTP and set a new password."""
    check_login_allowed(request, f"reset:{payload.email}")

    from datetime import datetime, timezone

    user = db.query(User).filter(User.email == payload.email).first()
    invalid = HTTPException(status_code=400, detail="Invalid or expired code")

    if not user or not user.reset_otp_hash or not user.reset_otp_expires:
        record_failed_login(request, f"reset:{payload.email}")
        raise invalid

    expires = user.reset_otp_expires
    if expires.tzinfo is None:  # SQLite loses tzinfo
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        record_failed_login(request, f"reset:{payload.email}")
        raise invalid

    if not verify_password(payload.otp, user.reset_otp_hash):
        record_failed_login(request, f"reset:{payload.email}")
        raise invalid

    user.hashed_password = hash_password(payload.new_password)
    user.reset_otp_hash = None
    user.reset_otp_expires = None
    db.commit()

    reset_login_attempts(request, f"reset:{payload.email}")
    return {"message": "Password reset successful. You can now log in."}


# ---------------- Push notifications ----------------

@router.post("/push-token")
def save_push_token(
    payload: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save this device's Expo push token for status notifications."""
    current_user.push_token = payload.push_token
    db.commit()
    return {"message": "Push token saved"}
