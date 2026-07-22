from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.user import User
from app.schemas.user import RoleUpdate, UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    role: str | None = Query(default=None),
):
    """List all users (admin only). Optionally filter by role."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    return query.order_by(User.created_at.desc()).all()


@router.get("/officers", response_model=list[UserOut])
def list_officers(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Users who can be assigned complaints (officers + admins)."""
    return (
        db.query(User)
        .filter(User.role.in_(["OFFICER", "ADMIN"]))
        .order_by(User.full_name)
        .all()
    )


@router.patch("/{user_id}/role", response_model=UserOut)
def update_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Change a user's role (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't let an admin demote themselves (avoids locking out the last admin).
    if user.id == current_admin.id and payload.role != "ADMIN":
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own admin role",
        )

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user
