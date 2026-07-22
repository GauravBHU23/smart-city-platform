# Admin Panel (Next.js)

Web dashboard for the Smart City platform. Talks to the FastAPI backend.

## Pages
- **/** — Login (ADMIN role only)
- **/dashboard** — Overview: totals + breakdown by status / priority / category
- **/dashboard/complaints** — Table with status filter; change status & priority inline
- **/dashboard/map** — Complaint locations plotted from GeoJSON

## Setup

1. Start the backend:
   ```powershell
   cd ..\backend
   .\venv\Scripts\activate
   python -m uvicorn app.main:app --reload
   ```
2. Make sure an admin exists: `python create_admin.py` (admin@city.com / admin123).

## Run

```powershell
cd admin
npm run dev
```
Open http://localhost:3000 and log in with the admin account.

Backend URL defaults to `http://127.0.0.1:8000`. Override with a `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Structure

```
app/
├── page.js                       ← login
├── layout.js
├── globals.css
└── dashboard/
    ├── layout.js                 ← sidebar + admin auth guard
    ├── page.js                   ← overview
    ├── complaints/page.js        ← table + inline status/priority
    └── map/page.js               ← scatter map from GeoJSON
lib/
├── config.js  ├── api.js  └── theme.js
```

The map is a dependency-free scatter plot. It can later be upgraded to
MapLibre + OpenStreetMap tiles.
