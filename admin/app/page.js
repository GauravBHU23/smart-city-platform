"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api, saveToken } from "@/lib/api";
import { useToast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side checks so users get a clear message instead of a raw
    // validation error from the backend.
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      toast.error("Please enter your email and password.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({
        email: cleanEmail,
        password,
      });
      if (data.user.role !== "ADMIN") {
        setError("This account is not an admin.");
        toast.error("This account is not an admin.");
        setLoading(false);
        return;
      }
      saveToken(data.access_token);
      toast.success(`Welcome, ${data.user.full_name}! 👋`);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form className="card" style={styles.card} onSubmit={onSubmit}>
        <div style={styles.logo}>🏙️</div>
        <h1 style={styles.title}>Smart City Admin</h1>
        <p style={styles.sub}>Sign in to manage complaints</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          className="input"
          style={styles.field}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@city.com"
        />

        <label style={styles.label}>Password</label>
        <input
          className="input"
          style={styles.field}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button className="btn" style={styles.btn} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: { width: "100%", maxWidth: 380 },
  logo: { fontSize: 44, textAlign: "center" },
  title: { textAlign: "center", fontSize: 24, marginTop: 6 },
  sub: { textAlign: "center", color: "var(--muted)", marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 },
  field: { width: "100%", marginBottom: 16 },
  btn: { width: "100%", padding: 12, marginTop: 4 },
  error: {
    background: "#fef2f2",
    color: "var(--danger)",
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 600,
  },
};
