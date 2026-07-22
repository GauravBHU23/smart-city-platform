# Smart City Platform

A citizen complaint & city-services platform.

- **mobile/** — React Native (Expo) citizen app
- **backend/** — FastAPI + PostgreSQL REST API
- **admin/** — Next.js admin panel
- **ai-service/** — Python AI/ML (classification, priority, duplicate detection)
- **docs/** — architecture notes

## Architecture

```
React Native (Expo)  --HTTP-->  FastAPI  --SQLAlchemy-->  PostgreSQL (+PostGIS)
                                   |
                                   +--> AI service, Firebase FCM, free APIs
Next.js Admin        --HTTP-->  FastAPI
```

## Status

- **Step 1 DONE** — scaffolding + FastAPI + PostgreSQL connection.
- **Step 2 DONE** — User model + Register/Login + JWT auth + roles (CITIZEN/OFFICER/ADMIN).
- **Step 3 DONE** — Complaint system + image upload + admin analytics.
- **Step 4 DONE** — Mobile app (Expo): Login/Register/Home/Report/MyComplaints/Profile, JWT auth, GPS.
- **Step 5 DONE** — Admin panel (Next.js): login, overview analytics, complaints table (inline status/priority), map.
- **Step 6 DONE** — AI service (scikit-learn): category classification, priority prediction, duplicate detection; wired into complaint creation with graceful fallback.
- **Step 7 DONE** — Mobile polish: photo upload on complaints, complaint detail screen (photo + status timeline), Weather screen (Open-Meteo, free, no key).
- **Step 8 DONE** — Deployment: free-tier guide + config (Neon DB, Render backend/AI, Vercel admin, Expo APK). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### API endpoints so far

Auth:
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`

Complaints (citizen):
- `POST /complaints`, `GET /complaints/my`, `GET /complaints/{id}`

Complaints (admin/officer):
- `GET /complaints` (filter by `?status=` `?category=`)
- `PATCH /complaints/{id}/status`, `/priority`, `/assign?officer_id=`

AI-assisted:
- `POST /complaints/ai-suggest` (preview AI category + priority)

Uploads & analytics:
- `POST /uploads/image` (returns `/files/<name>`; images served at `GET /files/<name>`)
- `GET /analytics/summary`, `GET /analytics/geojson`

### Create an admin user

```powershell
cd backend
.\venv\Scripts\activate
python create_admin.py     # makes admin@city.com / admin123
```


### Run the backend

```powershell
cd backend
.\venv\Scripts\activate
# One-time: create the database (asks for your postgres password)
.\create_db.ps1
# Edit .env and set YOUR_POSTGRES_PASSWORD to your real password
python -m uvicorn app.main:app --reload
```

Then open:
- http://127.0.0.1:8000/         -> API running
- http://127.0.0.1:8000/health   -> healthy
- http://127.0.0.1:8000/db-test  -> {"database": "connected"}
- http://127.0.0.1:8000/docs     -> Swagger UI

To make it reachable from your phone (same Wi-Fi):
```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0
```
Find your laptop IP with `ipconfig` and use `http://<your-ip>:8000` in the app.

### Create the mobile app

```powershell
cd mobile
npx create-expo-app@latest .
npx expo start
```

## Next: Step 2

SQLAlchemy models + User table + Register/Login + JWT auth.
