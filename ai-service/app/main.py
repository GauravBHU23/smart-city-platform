from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.models_store import (
    classify_category,
    find_duplicates,
    predict_priority,
)

app = FastAPI(title="Smart City AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- request bodies ----------

class TextIn(BaseModel):
    text: str = Field(min_length=3)


class ExistingComplaint(BaseModel):
    id: int
    text: str


class DuplicateIn(BaseModel):
    text: str = Field(min_length=3)
    existing: list[ExistingComplaint] = []
    threshold: float = 0.35


# ---------- endpoints ----------

@app.get("/health")
def health():
    return {"status": "healthy", "service": "ai"}


@app.post("/classify")
def classify(payload: TextIn):
    """Predict the complaint category from its text."""
    return classify_category(payload.text)


@app.post("/predict-priority")
def priority(payload: TextIn):
    """Predict the complaint priority from its text."""
    return predict_priority(payload.text)


@app.post("/check-duplicate")
def check_duplicate(payload: DuplicateIn):
    """Check if the text is similar to any existing complaints."""
    existing = [e.model_dump() for e in payload.existing]
    return find_duplicates(payload.text, existing, payload.threshold)


@app.post("/analyze")
def analyze(payload: TextIn):
    """One call that returns category + priority together."""
    cat = classify_category(payload.text)
    pri = predict_priority(payload.text)
    return {
        "category": cat["category"],
        "category_confidence": cat["confidence"],
        "priority": pri["priority"],
        "priority_confidence": pri["confidence"],
    }
