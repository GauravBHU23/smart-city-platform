"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { api, imageUrl } from "@/lib/api";
import { PRIORITIES, STATUSES, priorityColor, statusColor } from "@/lib/theme";

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setError("");
    try {
      const [complaint, offs] = await Promise.all([
        api.getComplaint(id),
        api.listOfficers(),
      ]);
      setC(complaint);
      setOfficers(offs);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function run(fn) {
    setSaving(true);
    try {
      const updated = await fn();
      setC(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!c) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  const img = imageUrl(c.image_url);
  const currentIdx = STATUSES.indexOf(c.status);
  const officerName = c.assigned_to
    ? officers.find((o) => o.id === c.assigned_to)?.full_name ||
      `User #${c.assigned_to}`
    : null;

  return (
    <div>
      <Link href="/dashboard/complaints" style={styles.back}>
        ← Back to complaints
      </Link>

      <div style={styles.grid}>
        {/* Left: details */}
        <div>
          <div className="card">
            <div style={styles.top}>
              <span style={styles.cat}>{c.category}</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                #{c.id}
              </span>
            </div>
            <h1 style={{ fontSize: 24, margin: "6px 0 10px" }}>{c.title}</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              {c.description}
            </p>

            {img && (
              <img src={img} alt="complaint" style={styles.image} />
            )}

            <Info label="📍 Location">
              {c.address ||
                (c.latitude
                  ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`
                  : "—")}
            </Info>
            {c.latitude && (
              <Info label="🗺️ Coordinates">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--primary)" }}
                >
                  {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)} ↗
                </a>
              </Info>
            )}
            <Info label="🗓️ Reported">
              {new Date(c.created_at).toLocaleString()}
            </Info>
            <Info label="🔄 Last updated">
              {new Date(c.updated_at).toLocaleString()}
            </Info>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 style={styles.h3}>Status</h3>
            <select
              className="select"
              value={c.status}
              disabled={saving}
              onChange={(e) =>
                run(() => api.updateStatus(c.id, e.target.value))
              }
              style={{ width: "100%", color: statusColor[c.status], fontWeight: 700 }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>

            {/* mini timeline */}
            <div style={{ marginTop: 16 }}>
              {STATUSES.map((s, i) => (
                <div key={s} style={styles.tlRow}>
                  <span
                    style={{
                      ...styles.dot,
                      background: i <= currentIdx ? statusColor[c.status] : "var(--border)",
                      transform: i === currentIdx ? "scale(1.4)" : "none",
                    }}
                  />
                  <span
                    style={{
                      color: i <= currentIdx ? "var(--text)" : "var(--muted)",
                      fontWeight: i <= currentIdx ? 600 : 400,
                      fontSize: 13,
                    }}
                  >
                    {s.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={styles.h3}>Priority</h3>
            <select
              className="select"
              value={c.priority}
              disabled={saving}
              onChange={(e) =>
                run(() => api.updatePriority(c.id, e.target.value))
              }
              style={{ width: "100%", color: priorityColor[c.priority], fontWeight: 700 }}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 style={styles.h3}>Assign to officer</h3>
            <select
              className="select"
              value={c.assigned_to || ""}
              disabled={saving}
              onChange={(e) =>
                e.target.value &&
                run(() => api.assignComplaint(c.id, e.target.value))
              }
              style={{ width: "100%" }}
            >
              <option value="">— not assigned —</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name} ({o.role})
                </option>
              ))}
            </select>
            {officerName && (
              <p style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
                Currently assigned to <b>{officerName}</b>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }) {
  return (
    <div style={styles.info}>
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ textAlign: "right", flexShrink: 1 }}>{children}</span>
    </div>
  );
}

const styles = {
  back: { color: "var(--primary)", fontWeight: 600, display: "inline-block", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cat: { fontSize: 12, fontWeight: 800, color: "var(--muted)", letterSpacing: 1 },
  image: {
    width: "100%",
    maxHeight: 320,
    objectFit: "cover",
    borderRadius: 12,
    margin: "16px 0",
    border: "1px solid var(--border)",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderTop: "1px solid var(--border)",
    fontSize: 14,
  },
  h3: { fontSize: 15, marginBottom: 10 },
  tlRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
};
