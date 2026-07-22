from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.complaint import PRIORITIES, STATUSES


# ---- Requests ----

class ComplaintCreate(BaseModel):
    category: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=5)
    image_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None


class ComplaintStatusUpdate(BaseModel):
    status: str
    # Optional note shown to the citizen, e.g. "Pothole repaired on 20 July".
    note: str | None = Field(default=None, max_length=500)

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        v = v.upper()
        if v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v


class FeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=500)


class ComplaintPriorityUpdate(BaseModel):
    priority: str

    @field_validator("priority")
    @classmethod
    def valid_priority(cls, v: str) -> str:
        v = v.upper()
        if v not in PRIORITIES:
            raise ValueError(f"priority must be one of {PRIORITIES}")
        return v


# ---- Response ----

class StatusHistoryOut(BaseModel):
    id: int
    old_status: str | None
    new_status: str
    note: str | None
    changed_by: int
    changed_by_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id: int
    user_id: int
    category: str
    title: str
    description: str
    image_url: str | None
    latitude: float | None
    longitude: float | None
    address: str | None
    status: str
    priority: str
    assigned_to: int | None
    resolution_note: str | None = None
    feedback_rating: int | None = None
    feedback_comment: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintDetailOut(ComplaintOut):
    """Complaint plus its full status history (for detail pages)."""

    history: list[StatusHistoryOut] = []
