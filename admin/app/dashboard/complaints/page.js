"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { PRIORITIES, STATUSES, priorityColor, statusColor } from "@/lib/theme";

export default function ComplaintsPage() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listComplaints(
        statusFilter ? { status: statusFilter } : {}
      );
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id, status) {
    setSavingId(id);
    try {
      const updated = await api.updateStatus(id, status);
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }

  async function changePriority(id, priority) {
    setSavingId(id);
    try {
      const updated = await api.updatePriority(id, priority);
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div style={styles.head}>
        <div>
          <h1 style={{ fontSize: 26 }}>Complaints</h1>
          <p style={{ color: "var(--muted)" }}>{items.length} shown</p>
        </div>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Complaint</th>
              <th>Category</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ color: "var(--muted)" }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: "var(--muted)" }}>
                  No complaints found.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} style={{ opacity: savingId === c.id ? 0.5 : 1 }}>
                <td>#{c.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ color: "var(--muted)", maxWidth: 260 }}>
                    {c.description}
                  </div>
                </td>
                <td>{c.category}</td>
                <td style={{ fontSize: 13 }}>
                  {c.address ||
                    (c.latitude
                      ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                      : "—")}
                </td>
                <td>
                  <select
                    value={c.priority}
                    onChange={(e) => changePriority(c.id, e.target.value)}
                    style={{
                      ...styles.pill,
                      color: priorityColor[c.priority],
                      borderColor: priorityColor[c.priority],
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={c.status}
                    onChange={(e) => changeStatus(c.id, e.target.value)}
                    style={{
                      ...styles.pill,
                      color: statusColor[c.status],
                      borderColor: statusColor[c.status],
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ fontSize: 13, color: "var(--muted)" }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  pill: {
    border: "1.5px solid",
    borderRadius: 20,
    padding: "5px 10px",
    fontWeight: 700,
    fontSize: 12,
    background: "#fff",
  },
};
