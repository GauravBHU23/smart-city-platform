// Backend API base URL.
//
// PRODUCTION (APK / any phone, anywhere): the deployed Render backend.
export const API_URL = "https://smart-city-api-kary.onrender.com";

// ---------------------------------------------------------------------------
// LOCAL DEVELOPMENT: to test against a backend running on your laptop instead,
// comment the line above and use one of these:
//   Physical phone (Expo Go): "http://<your-laptop-ip>:8000"  (same Wi-Fi)
//   Android emulator:         "http://10.0.2.2:8000"
// and start the backend with: uvicorn app.main:app --reload --host 0.0.0.0
