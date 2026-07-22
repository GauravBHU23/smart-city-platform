import { API_URL } from "./config";

const TOKEN_KEY = "smartcity_admin_token";

export function saveToken(token) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the backend. Is it running on " + API_URL + " ?"
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
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

export const api = {
  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  listComplaints: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.category) q.set("category", params.category);
    const qs = q.toString();
    return request(`/complaints${qs ? "?" + qs : ""}`);
  },
  getComplaint: (id) => request(`/complaints/${id}`),
  updateStatus: (id, status) =>
    request(`/complaints/${id}/status`, { method: "PATCH", body: { status } }),
  updatePriority: (id, priority) =>
    request(`/complaints/${id}/priority`, {
      method: "PATCH",
      body: { priority },
    }),
  assignComplaint: (id, officerId) =>
    request(`/complaints/${id}/assign?officer_id=${officerId}`, {
      method: "PATCH",
    }),

  // Users
  listUsers: (role) =>
    request(`/users${role ? "?role=" + role : ""}`),
  listOfficers: () => request("/users/officers"),
  updateRole: (id, role) =>
    request(`/users/${id}/role`, { method: "PATCH", body: { role } }),

  summary: () => request("/analytics/summary"),
  geojson: () => request("/analytics/geojson"),
};

// Full URL for a backend image path (e.g. /files/x.png).
export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
