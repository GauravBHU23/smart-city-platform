from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core import ai_client
from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.complaint import PRIORITIES, Complaint
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintOut,
    ComplaintPriorityUpdate,
    ComplaintStatusUpdate,
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])


# ---------------- Citizen endpoints ----------------

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ask the AI service to suggest a priority from the text.
    # If the AI service is down, fall back to MEDIUM — complaints never block.
    priority = "MEDIUM"
    ai = ai_client.analyze(f"{payload.title}. {payload.description}")
    if ai and ai.get("priority") in PRIORITIES:
        priority = ai["priority"]

    complaint = Complaint(
        user_id=current_user.id,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        image_url=payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        status="PENDING",
        priority=priority,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/ai-suggest")
def ai_suggest(
    payload: ComplaintCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Preview AI category + priority for the given text, without saving.
    The mobile app can call this to pre-fill the form.
    """
    result = ai_client.analyze(f"{payload.title}. {payload.description}")
    if result is None:
        return {"available": False}
    return {"available": True, **result}


@router.get("/my", response_model=list[ComplaintOut])
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Complaint)
        .filter(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Citizens can only view their own; admins/officers can view any.
    if complaint.user_id != current_user.id and current_user.role == "CITIZEN":
        raise HTTPException(status_code=403, detail="Not allowed to view this complaint")

    return complaint


# ---------------- Admin / officer endpoints ----------------

@router.get("", response_model=list[ComplaintOut])
def list_all_complaints(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    status_filter: str | None = Query(default=None, alias="status"),
    category: str | None = None,
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter.upper())
    if category:
        query = query.filter(Complaint.category == category)
    return query.order_by(Complaint.created_at.desc()).all()


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = payload.status
    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/priority", response_model=ComplaintOut)
def update_priority(
    complaint_id: int,
    payload: ComplaintPriorityUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.priority = payload.priority
    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/assign", response_model=ComplaintOut)
def assign_complaint(
    complaint_id: int,
    officer_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer = db.query(User).filter(User.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")

    complaint.assigned_to = officer_id
    if complaint.status == "PENDING":
        complaint.status = "ASSIGNED"
    db.commit()
    db.refresh(complaint)
    return complaint
