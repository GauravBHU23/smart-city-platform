"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { statusColor } from "@/lib/theme";

// A lightweight scatter plot of complaint coordinates (no external map library).
// Later this can be swapped for MapLibre + OpenStreetMap tiles.
export default function MapPage() {
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .geojson()
      .then((fc) => setFeatures(fc.features || []))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;

  const pts = features
    .map((f) => ({
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      ...f.properties,
    }))
    .filter((p) => typeof p.lat === "number" && typeof p.lon === "number");

  // Compute bounds to place points in a 0..100 plane.
  const lats = pts.map((p) => p.lat);
  const lons = pts.map((p) => p.lon);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);
  const spanLat = maxLat - minLat || 1;
  const spanLon = maxLon - minLon || 1;

  function pos(p) {
    // pad 8% so dots aren't on the edge; invert lat so north is up
    const x = 8 + ((p.lon - minLon) / spanLon) * 84;
    const y = 8 + ((maxLat - p.lat) / spanLat) * 84;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Complaint Map</h1>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>
        {pts.length} complaints with location
      </p>

      <div style={styles.plane}>
        {pts.length === 0 && (
          <div style={styles.empty}>No location data yet.</div>
        )}
        {pts.map((p) => (
          <div
            key={p.id}
            title={`#${p.id} ${p.title} (${p.status})`}
            style={{
              ...styles.dot,
              ...pos(p),
              background: statusColor[p.status] || "var(--primary)",
            }}
          />
        ))}
      </div>

      <div style={styles.legend}>
        {Object.entries(statusColor).map(([k, c]) => (
          <span key={k} style={styles.legItem}>
            <span style={{ ...styles.legDot, background: c }} />
            {k.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  plane: {
    position: "relative",
    height: 460,
    background:
      "repeating-linear-gradient(0deg,#e2e8f0 0 1px,transparent 1px 40px)," +
      "repeating-linear-gradient(90deg,#e2e8f0 0 1px,transparent 1px 40px),#f8fafc",
    border: "1px solid var(--border)",
    borderRadius: 14,
  },
  empty: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
  },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    transform: "translate(-50%,-50%)",
    cursor: "pointer",
  },
  legend: { display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 },
  legItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "var(--muted)",
  },
  legDot: { width: 12, height: 12, borderRadius: "50%" },
};
