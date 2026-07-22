from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base

# Allowed complaint statuses (the workflow).
STATUSES = [
    "PENDING",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
]

PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    category = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    image_url = Column(String, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)

    status = Column(String, nullable=False, default="PENDING", index=True)
    priority = Column(String, nullable=False, default="MEDIUM", index=True)

    # Which officer/admin it's assigned to (optional).
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Note the admin/officer leaves when updating status (visible to the citizen),
    # e.g. "Pothole repaired on 20 July".
    resolution_note = Column(Text, nullable=True)

    # Citizen feedback after the complaint is RESOLVED/CLOSED.
    feedback_rating = Column(Integer, nullable=True)  # 1..5
    feedback_comment = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", foreign_keys=[user_id])
    history = relationship(
        "StatusHistory",
        back_populates="complaint",
        order_by="StatusHistory.created_at",
        cascade="all, delete-orphan",
    )


class StatusHistory(Base):
    """Audit trail: every status/assignment change, who made it and when."""

    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(
        Integer, ForeignKey("complaints.id"), nullable=False, index=True
    )
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    note = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    complaint = relationship("Complaint", back_populates="history")
    actor = relationship("User", foreign_keys=[changed_by])
