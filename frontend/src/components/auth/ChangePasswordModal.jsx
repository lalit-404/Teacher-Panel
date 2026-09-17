import React, { useState } from "react";
import { Lock } from "lucide-react";
import Modal from "../common/Modal";
import LoginField from "../common/LoginField";

export default function ChangePasswordModal({ onSubmit }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (pwd.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pwd === "123456") {
      setError("New password must be different from 123456.");
      return;
    }
    if (pwd !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(pwd);
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Set a new password">
      <p className="text-sm mb-4" style={{ color: "var(--tp-ink-soft)" }}>
        You're signing in with a temporary password. Choose a new one to continue.
      </p>
      <div className="space-y-3">
        <LoginField
          icon={Lock}
          type="password"
          placeholder="New password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <LoginField
          icon={Lock}
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--tp-absent-fg)" }}>
          {error}
        </p>
      )}
      <button
        className="tp-btn mt-4"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Updating..." : "Update password"}
      </button>
    </Modal>
  );
}
