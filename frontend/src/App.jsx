import React from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import LoginPage from "./components/auth/LoginPage";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

export default function App() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={`tp-root ${theme}`} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--tp-ink-soft)" }}>Loading…</p>
      </div>
    );
  }

  if (!session) return <LoginPage />;
  if (session.role === "admin") return <AdminDashboard />;
  return <TeacherDashboard />;
}
