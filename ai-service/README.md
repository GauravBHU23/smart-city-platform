# AI Service (Python + scikit-learn)

A small FastAPI microservice that adds intelligence to complaints:
- **Category classification** — predicts ROAD / WATER / ELECTRICITY / GARBAGE / STREETLIGHT / OTHER from text
- **Priority prediction** — predicts LOW / MEDIUM / HIGH / URGENT
- **Duplicate detection** — TF-IDF cosine similarity against existing complaints

100% free & offline — no paid APIs, no GPU. Uses TF-IDF + Logistic Regression.

## Setup

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python train.py          # trains & saves models to ./models/
```

## Run (port 8020)

```powershell
python -m uvicorn app.main:app --reload --port 8020
```

Swagger: http://127.0.0.1:8020/docs

## Endpoints
- `POST /classify`         → `{category, confidence}`
- `POST /predict-priority` → `{priority, confidence}`
- `POST /analyze`          → category + priority together
- `POST /check-duplicate`  → `{is_duplicate, matches[]}`

## How the backend uses it

The FastAPI backend (`backend/app/core/ai_client.py`) calls this service when a
complaint is created, to auto-set its priority. If this service is **not running**,
the backend falls back to `MEDIUM` — complaints never break.

So the AI service is **optional**: run it for smart priority, skip it and everything
still works.

## Improving accuracy

The seed dataset (`data/training_data.py`) has ~43 examples — fine for a demo but
low confidence. As real complaints pile up in PostgreSQL, export them as
`(text, category, priority)` rows, add them to the training data, and re-run
`python train.py`.
