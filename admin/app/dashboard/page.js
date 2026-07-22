"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { priorityColor, statusColor } from "@/lib/theme";

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.summary().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  const resolved =
    (data.by_status?.RESOLVED || 0) + (data.by_status?.CLOSED || 0);
  const open = data.total_complaints - resolved;

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Overview</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        City-wide complaint statistics
      </p>

      <div style={styles.statGrid}>
        <Stat label="Total Complaints" value={data.total_complaints} icon="📋" />
        <Stat label="Open" value={open} icon="🟠" />
        <Stat label="Resolved / Closed" value={resolved} icon="✅" />
        <Stat label="Registered Users" value={data.total_users} icon="👥" />
      </div>

      <div style={styles.row}>
        <Breakdown
          title="By Status"
          data={data.by_status}
          colors={statusColor}
        />
        <Breakdown
          title="By Priority"
          data={data.by_priority}
          colors={priorityColor}
        />
        <Breakdown title="By Category" data={data.by_category} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="card" style={styles.stat}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function Breakdown({ title, data = {}, colors }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="card" style={{ flex: 1, minWidth: 240 }}>
      <h3 style={{ marginBottom: 14, fontSize: 16 }}>{title}</h3>
      {entries.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No data yet</p>
      )}
      {entries.map(([key, value]) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <div style={styles.barTop}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {key.replace("_", " ")}
            </span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{value}</span>
          </div>
          <div style={styles.barTrack}>
            <div
              style={{
                ...styles.barFill,
                width: `${(value / max) * 100}%`,
                background: colors?.[key] || "var(--primary)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  stat: { display: "flex", alignItems: "center", gap: 16 },
  statIcon: { fontSize: 30 },
  statValue: { fontSize: 30, fontWeight: 800 },
  statLabel: { color: "var(--muted)", fontSize: 13 },
  row: { display: "flex", gap: 16, flexWrap: "wrap" },
  barTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  barTrack: {
    height: 8,
    background: "var(--bg)",
    borderRadius: 20,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 20 },
};
