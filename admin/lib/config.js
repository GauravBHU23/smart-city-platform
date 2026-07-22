// Backend API base URL.
// Defaults to the deployed Render backend so the hosted admin panel works
// out of the box. For local development against a laptop backend, set
// NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 in admin/.env.local
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://smart-city-api-kary.onrender.com";
