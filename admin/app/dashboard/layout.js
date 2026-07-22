"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api, clearToken, getToken } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/complaints", label: "Complaints", icon: "📋" },
  { href: "/dashboard/map", label: "Map", icon: "🗺️" },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Guard: must have a valid admin token, else send to login.
    (async () => {
      if (!getToken()) {
        router.replace("/");
        return;
      }
      try {
        const me = await api.me();
        if (me.role !== "ADMIN") {
          clearToken();
          router.replace("/");
          return;
        }
        setUser(me);
      } catch {
        clearToken();
        router.replace("/");
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/");
  }

  if (checking) {
    return <div style={styles.loading}>Loading…</div>;
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>🏙️ Smart City</div>
        <nav style={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={styles.userBox}>
          <div style={styles.userName}>{user?.full_name}</div>
          <div style={styles.userRole}>{user?.role}</div>
          <button onClick={logout} style={styles.logout}>
            Logout
          </button>
        </div>
      </aside>
      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
  },
  shell: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: 240,
    background: "#0f172a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: 20,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: { fontSize: 20, fontWeight: 800, marginBottom: 30 },
  nav: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 10,
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: 14,
  },
  navItemActive: { background: "#2563eb", color: "#fff" },
  userBox: { borderTop: "1px solid #1e293b", paddingTop: 16 },
  userName: { fontWeight: 700, fontSize: 14 },
  userRole: { color: "#64748b", fontSize: 12, marginBottom: 12 },
  logout: {
    width: "100%",
    background: "transparent",
    border: "1px solid #334155",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "8px 0",
    fontWeight: 600,
    fontSize: 13,
  },
  content: { flex: 1, padding: 28, maxWidth: 1200 },
};
