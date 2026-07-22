"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

const ROLES = ["CITIZEN", "OFFICER", "ADMIN"];
const roleColor = { CITIZEN: "#64748b", OFFICER: "#7c3aed", ADMIN: "#2563eb" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [meId, setMeId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [list, me] = await Promise.all([api.listUsers(), api.me()]);
      setUsers(list);
      setMeId(me.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    setSavingId(id);
    try {
      const updated = await api.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Users</h1>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>
        {users.length} registered
      </p>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u.id} style={{ opacity: savingId === u.id ? 0.5 : 1 }}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td style={{ fontSize: 13, color: "var(--muted)" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {u.id === meId ? (
                      <span
                        className="badge"
                        style={{
                          background: roleColor[u.role] + "22",
                          color: roleColor[u.role],
                        }}
                      >
                        {u.role} (you)
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        style={{
                          border: "1.5px solid " + roleColor[u.role],
                          color: roleColor[u.role],
                          borderRadius: 20,
                          padding: "5px 10px",
                          fontWeight: 700,
                          fontSize: 12,
                          background: "#fff",
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
