import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken } from "../api/client";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { role, user }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .fetchMe()
      .then((data) => setSession({ role: data.role, user: data.user }))
      .catch(() => authApi.logout())
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const data = await authApi.login(identifier, password);
    setSession({ role: data.role, user: data.user });
    return data;
  }

  function logout() {
    authApi.logout();
    setSession(null);
  }

  async function changePassword(newPassword) {
    const data = await authApi.changePassword(newPassword);
    setSession((s) => (s ? { ...s, user: data.user } : s));
  }

  function updateSessionUser(patch) {
    setSession((s) => (s ? { ...s, user: { ...s.user, ...patch } } : s));
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, login, logout, changePassword, updateSessionUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
