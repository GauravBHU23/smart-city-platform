# Mobile App (React Native + Expo)

Citizen app for the Smart City platform. Connects to the FastAPI backend.

## Screens
- Login / Register (JWT auth, token saved in AsyncStorage)
- Home (quick actions)
- Report Complaint (category + photo upload + GPS location + description)
- My Complaints (list with status/priority badges, pull-to-refresh) → tap for detail
- Complaint Detail (photo, location, status timeline)
- Weather (Open-Meteo free API — current + 5-day forecast for your location)
- Profile (user info + logout)

## Setup — IMPORTANT before running

1. Start the backend so the phone can reach it:
   ```powershell
   cd ..\backend
   .\venv\Scripts\activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0
   ```
2. Set your laptop's Wi-Fi IP in [src/config.js](src/config.js) `API_URL`.
   Find it with `ipconfig` (look for IPv4 Address). Phone + laptop must be on
   the same Wi-Fi.

## Run

```powershell
cd mobile
npx expo start
```

- **Physical phone:** install **Expo Go**, scan the QR code.
- **Android emulator:** press `a`, and set `API_URL` to `http://10.0.2.2:8000`.

## Project structure

```
src/
├── config.js            ← API_URL (set your laptop IP here)
├── theme.js             ← colors + status/priority badge colors
├── api/client.js        ← fetch wrapper + token storage
├── context/AuthContext.js
├── navigation/index.js  ← auth stack vs app stack
└── screens/
    ├── LoginScreen.js
    ├── RegisterScreen.js
    ├── HomeScreen.js
    ├── ReportComplaintScreen.js
    ├── MyComplaintsScreen.js
    └── ProfileScreen.js
```
