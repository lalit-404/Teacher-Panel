import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import Brand from "../common/Brand";
import ThemeToggle from "../common/ThemeToggle";
import LoginField from "../common/LoginField";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setError("");
    setSubmitting(true);
    try {
      await login(id.trim(), password);
    } catch (err) {
      setError(err.message || "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`tp-root ${theme}`}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="mb-6">
          <Brand center />
        </div>

        <div className="tp-login-card">
          <div style={{ textAlign: "center" }}>
            <h2 className="font-semibold" style={{ fontSize: "1.4rem", marginBottom: "0.3rem" }}>
              Login
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--tp-ink-soft)" }}>
              Enter your email and password to continue.
            </p>
          </div>

          <div className="space-y-3">
            <LoginField
              icon={User}
              type="text"
              placeholder="Email"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <LoginField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          <p className="text-xs mt-2" style={{ color: "var(--tp-muted)" }}>
            Teachers and admins sign in from the same form - what you see next depends on your
            account.
          </p>

          {error && (
            <p className="text-xs mt-3" style={{ color: "var(--tp-absent-fg)" }}>
              {error}
            </p>
          )}

          <button
            className="tp-btn"
            style={{ width: "100%", justifyContent: "center", marginTop: "1.1rem" }}
            disabled={id.trim() === "" || password.trim() === "" || submitting}
            onClick={handleSignIn}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className="text-xs mt-5 text-center" style={{ color: "var(--tp-muted)" }}>
          Need help? Contact your school administrator.
        </p>
      </div>
    </div>
  );
}
