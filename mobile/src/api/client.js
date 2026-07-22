import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../config";

const TOKEN_KEY = "smartcity_token";

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Core request helper. Adds the JWT automatically and parses JSON.
async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(
      "Cannot reach the server. Check API_URL in src/config.js and that the backend is running."
    );
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      (data && data.detail) ||
      (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
      `Request failed (${res.status})`;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail)
    );
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  // Complaints
  createComplaint: (payload) =>
    request("/complaints", { method: "POST", body: payload }),
  myComplaints: () => request("/complaints/my"),
  getComplaint: (id) => request(`/complaints/${id}`),
  submitFeedback: (id, rating, comment) =>
    request(`/complaints/${id}/feedback`, {
      method: "POST",
      body: { rating, comment: comment || null },
    }),

  // Upload an image (multipart). `asset` is an expo-image-picker asset.
  uploadImage: async (asset) => {
    const token = await getToken();
    const form = new FormData();
    const name = asset.fileName || `photo_${Date.now()}.jpg`;
    const type = asset.mimeType || "image/jpeg";
    form.append("file", { uri: asset.uri, name, type });

    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.detail) || "Image upload failed");
    }
    return data; // { image_url }
  },
};

// Build a full URL for an image path returned by the backend (e.g. /uploads/x.jpg).
export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
