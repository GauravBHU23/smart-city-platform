"use client";

// Tiny dependency-free toast system.
// Wrap the app in <ToastProvider> and call useToast() → toast.success("...") etc.

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const ICONS = { success: "✅", error: "❌", info: "ℹ️" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (type, message, duration = 3200) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const toast = {
    success: (msg, d) => show("success", msg, d),
    error: (msg, d) => show("error", msg, d),
    info: (msg, d) => show("info", msg, d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={styles.stack}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ ...styles.toast, ...styles[t.type] }}
            onClick={() => remove(t.id)}
          >
            <span>{ICONS[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = {
  stack: {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 360,
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    cursor: "pointer",
    animation: "toast-in 0.25s ease",
  },
  success: { background: "#16a34a" },
  error: { background: "#dc2626" },
  info: { background: "#2563eb" },
};
