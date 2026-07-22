import React, { createContext, useContext, useEffect, useState } from "react";

import { api, clearToken, getToken, saveToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, if a token exists, try to load the current user.
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const me = await api.me();
          setUser(me);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    await saveToken(data.access_token);
    setUser(data.user);
  }

  async function register(payload) {
    const data = await api.register(payload);
    await saveToken(data.access_token);
    setUser(data.user);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
