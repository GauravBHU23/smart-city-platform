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

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        v = v.upper()
        if v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v


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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
