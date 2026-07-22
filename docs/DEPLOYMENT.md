# Deployment Guide — Smart City Platform (Free Tier)

Goal: take the whole platform live using only **free** services.

| Piece | Free host | Result |
|-------|-----------|--------|
| PostgreSQL | **Neon** or **Supabase** | cloud database |
| Backend (FastAPI) | **Render** (free web service) | public API URL |
| Admin panel (Next.js) | **Vercel** (free) | public admin URL |
| Mobile app (Expo) | **EAS Build** (free tier) | installable APK |
| AI service (optional) | **Render** (second free service) | smarter priority |

> Free tiers have limits. On Render free, the API **sleeps after ~15 min idle**
> and takes ~30–50s to wake on the next request. Fine for demos/portfolios.

---

## Order of deployment

1. Database → 2. Backend → 3. Admin → 4. Mobile → 5. (optional) AI service

You need the **database URL** before the backend, and the **backend URL** before
the admin panel and mobile app.

---

## 1. Database — Neon (recommended, free Postgres)

1. Sign up at https://neon.tech (free).
2. Create a project → it gives you a **connection string** like:
   ```
   postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require
   ```
3. Copy it — this is your `DATABASE_URL`.

That's it. Tables are created automatically by the backend on first start
(`Base.metadata.create_all`). *(Supabase works the same way — use its
"Connection string" from Project Settings → Database.)*

---

## 2. Backend — Render

**Prep:** push the whole project to a **GitHub repo** first (Render deploys from GitHub).

```powershell
cd "d:\Smart City App"
git add .
git commit -m "Smart City platform"
# create a repo on github.com, then:
git remote add origin https://github.com/<you>/smart-city-platform.git
git branch -M main
git push -u origin main
```

**Deploy:**
1. Render → **New +** → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment variables** (Advanced → Add):
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon URL from step 1 |
   | `SECRET_KEY` | a long random string |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
   | `CORS_ORIGINS` | `*` for now (tighten in step 3) |
4. Create → wait for build. You get a URL like `https://smart-city-api.onrender.com`.
5. Test: open `https://smart-city-api.onrender.com/health` → `{"status":"healthy"}`.

> There's a `render.yaml` blueprint in `backend/` if you prefer Blueprint deploys.

**Create the admin user in production** (one-off): in Render → your service →
**Shell** tab, run:
```
python create_admin.py
```
(admin@city.com / admin123 — change these in `create_admin.py` before deploying).

> ⚠️ Uploaded images on Render free are stored on **ephemeral disk** and vanish on
> redeploy/restart. For permanent images use Cloudinary or Supabase Storage later.
> Complaints themselves are safe — they live in the database.

---

## 3. Admin Panel — Vercel

1. Vercel → **Add New** → **Project** → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `admin`
   - Framework preset: **Next.js** (auto-detected)
3. **Environment variable:**
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | your Render backend URL (e.g. `https://smart-city-api.onrender.com`) |
4. Deploy → you get `https://your-admin.vercel.app`.
5. **Go back to Render** and set `CORS_ORIGINS` to your Vercel URL, e.g.
   `https://your-admin.vercel.app` (redeploys the backend). This locks the API
   down so only your admin panel origin can call it from a browser.
6. Open the Vercel URL, log in with the admin account.

---

## 4. Mobile App — Expo EAS Build (free APK)

The mobile app talks to the backend over the internet now, so point it at the
deployed URL.

1. Edit [`mobile/src/config.js`](../mobile/src/config.js):
   ```js
   export const API_URL = "https://smart-city-api.onrender.com";
   ```
2. Install EAS CLI and log in (free Expo account):
   ```powershell
   npm install -g eas-cli
   eas login
   cd "d:\Smart City App\mobile"
   eas build:configure
   ```
3. Build an Android APK (free tier, builds in Expo's cloud):
   ```powershell
   eas build -p android --profile preview
   ```
   In `eas.json`, make sure the `preview` profile has `"android": { "buildType": "apk" }`.
4. When it finishes, Expo gives a download link → install the APK on any Android phone.

> No Play Store account needed for an APK you share directly. Publishing to the
> Play Store requires a one-time $25 Google developer account (optional).

---

## 5. AI Service — optional second Render service

The backend works without it (priority falls back to MEDIUM). To enable smart priority in production:

1. Render → New Web Service → same repo, **Root Directory:** `ai-service`.
2. **Build Command:** `pip install -r requirements.txt && python train.py`
   (the `&& python train.py` trains the models during build).
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. You get a URL like `https://smart-city-ai.onrender.com`.
5. On the **backend** Render service, add env var:
   | Key | Value |
   |-----|-------|
   | `AI_SERVICE_URL` | `https://smart-city-ai.onrender.com` |

---

## Post-deploy checklist

- [ ] `GET /health` on backend returns healthy
- [ ] Admin panel logs in and shows the dashboard
- [ ] Mobile APK registers a user + submits a complaint
- [ ] Complaint appears in the admin panel
- [ ] `CORS_ORIGINS` set to the real admin URL (not `*`)
- [ ] `SECRET_KEY` is a fresh random value (not the dev default)
- [ ] Admin password changed from `admin123`

## Cost summary

Everything above is **₹0** on free tiers. Optional paid upgrades later:
custom domain, always-on backend (no cold start), permanent image storage,
Play Store publishing.
