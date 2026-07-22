import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.core import ai_client
from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.complaint import PRIORITIES, Complaint, StatusHistory
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintDetailOut,
    ComplaintOut,
    ComplaintPriorityUpdate,
    ComplaintStatusUpdate,
    FeedbackCreate,
    StatusHistoryOut,
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def _log_history(db, complaint, actor, old_status, new_status, note=None):
    """Record a status change in the audit trail (caller commits)."""
    db.add(
        StatusHistory(
            complaint_id=complaint.id,
            changed_by=actor.id,
            old_status=old_status,
            new_status=new_status,
            note=note,
        )
    )


def _with_history(complaint: Complaint) -> ComplaintDetailOut:
    """Serialize a complaint including its history with actor names."""
    out = ComplaintDetailOut.model_validate(complaint)
    out.history = [
        StatusHistoryOut(
            id=h.id,
            old_status=h.old_status,
            new_status=h.new_status,
            note=h.note,
            changed_by=h.changed_by,
            changed_by_name=h.actor.full_name if h.actor else None,
            created_at=h.created_at,
        )
        for h in complaint.history
    ]
    return out


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

    # First history entry: complaint registered.
    _log_history(db, complaint, current_user, None, "PENDING", "Complaint registered")
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


# ---------------- Admin / officer endpoints ----------------
# (Declared before /{complaint_id} so "export" isn't parsed as an id.)

@router.get("/export")
def export_csv(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    status_filter: str | None = Query(default=None, alias="status"),
    category: str | None = None,
):
    """Download complaints as a CSV report (admin only)."""
    query = db.query(Complaint).options(joinedload(Complaint.user))
    if status_filter:
        query = query.filter(Complaint.status == status_filter.upper())
    if category:
        query = query.filter(Complaint.category == category)
    rows = query.order_by(Complaint.created_at.desc()).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "ID", "Category", "Title", "Description", "Status", "Priority",
            "Reported By", "Address", "Latitude", "Longitude",
            "Resolution Note", "Feedback Rating", "Created At", "Updated At",
        ]
    )
    for c in rows:
        writer.writerow(
            [
                c.id, c.category, c.title, c.description, c.status, c.priority,
                c.user.full_name if c.user else c.user_id,
                c.address or "", c.latitude or "", c.longitude or "",
                c.resolution_note or "", c.feedback_rating or "",
                c.created_at.isoformat(), c.updated_at.isoformat(),
            ]
        )

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=complaints.csv"},
    )


@router.get("", response_model=list[ComplaintOut])
def list_all_complaints(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    status_filter: str | None = Query(default=None, alias="status"),
    category: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter.upper())
    if category:
        query = query.filter(Complaint.category == category)
    return (
        query.order_by(Complaint.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


# ---------------- Shared detail + actions ----------------

@router.get("/{complaint_id}", response_model=ComplaintDetailOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = (
        db.query(Complaint)
        .options(joinedload(Complaint.history).joinedload(StatusHistory.actor))
        .filter(Complaint.id == complaint_id)
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Citizens can only view their own; admins/officers can view any.
    if complaint.user_id != current_user.id and current_user.role == "CITIZEN":
        raise HTTPException(status_code=403, detail="Not allowed to view this complaint")

    return _with_history(complaint)


@router.post("/{complaint_id}/feedback", response_model=ComplaintOut)
def submit_feedback(
    complaint_id: int,
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Citizen rates the resolution of their own complaint (1-5 stars)."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only rate your own complaint")
    if complaint.status not in ("RESOLVED", "CLOSED"):
        raise HTTPException(
            status_code=400,
            detail="You can rate a complaint only after it is resolved",
        )

    complaint.feedback_rating = payload.rating
    complaint.feedback_comment = payload.comment
    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old = complaint.status
    complaint.status = payload.status
    if payload.note:
        complaint.resolution_note = payload.note
    _log_history(db, complaint, admin, old, payload.status, payload.note)
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
    admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer = db.query(User).filter(User.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")

    complaint.assigned_to = officer_id
    old = complaint.status
    if complaint.status == "PENDING":
        complaint.status = "ASSIGNED"
    _log_history(
        db, complaint, admin, old, complaint.status,
        f"Assigned to {officer.full_name}",
    )
    db.commit()
    db.refresh(complaint)
    return complaint
