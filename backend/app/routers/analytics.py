from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.models.complaint import Complaint
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    total = db.query(func.count(Complaint.id)).scalar()

    by_status = dict(
        db.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )
    by_category = dict(
        db.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    by_priority = dict(
        db.query(Complaint.priority, func.count(Complaint.id))
        .group_by(Complaint.priority)
        .all()
    )
    total_users = db.query(func.count(User.id)).scalar()

    # Citizen satisfaction: average feedback rating on resolved complaints.
    avg_rating = (
        db.query(func.avg(Complaint.feedback_rating))
        .filter(Complaint.feedback_rating.isnot(None))
        .scalar()
    )
    rated_count = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.feedback_rating.isnot(None))
        .scalar()
    )

    # Average resolution time (in hours) for resolved/closed complaints.
    resolved = (
        db.query(Complaint.created_at, Complaint.updated_at)
        .filter(Complaint.status.in_(["RESOLVED", "CLOSED"]))
        .all()
    )
    avg_resolution_hours = None
    if resolved:
        total_hours = sum(
            (u - c).total_seconds() / 3600 for c, u in resolved
        )
        avg_resolution_hours = round(total_hours / len(resolved), 1)

    return {
        "total_complaints": total,
        "total_users": total_users,
        "by_status": by_status,
        "by_category": by_category,
        "by_priority": by_priority,
        "avg_feedback_rating": round(avg_rating, 2) if avg_rating else None,
        "feedback_count": rated_count,
        "avg_resolution_hours": avg_resolution_hours,
    }


@router.get("/geojson")
def geojson(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Complaints as GeoJSON FeatureCollection for the admin map / heatmap."""
    rows = (
        db.query(Complaint)
        .filter(Complaint.latitude.isnot(None), Complaint.longitude.isnot(None))
        .all()
    )
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [c.longitude, c.latitude]},
            "properties": {
                "id": c.id,
                "category": c.category,
                "status": c.status,
                "priority": c.priority,
                "title": c.title,
            },
        }
        for c in rows
    ]
    return {"type": "FeatureCollection", "features": features}
