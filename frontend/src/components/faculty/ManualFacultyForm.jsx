import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import LabeledInput from "../common/LabeledInput";

export default function ManualFacultyForm({ onSubmit, onBack }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() !== "" && id.trim() !== "" && gender.trim() !== "";

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ name, id, gender });
    } catch (err) {
      setError(err.message || "Could not add faculty.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button className="tp-btn tp-btn-ghost" style={{ padding: ".4rem .7rem" }} onClick={onBack}>
        <ChevronLeft size={15} /> Back
      </button>

      <div className="space-y-3 mt-4">
        <LabeledInput label="Name" value={name} onChange={setName} placeholder="e.g. Rohit Malhotra" />
        <LabeledInput label="ID" value={id} onChange={setId} placeholder="e.g. 1001" />
        <div>
          <label className="text-xs font-medium" style={{ color: "var(--tp-ink-soft)" }}>Gender</label>
          <select
            className="tp-plain-input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--tp-muted)" }}>
        The ID is saved to the Access USERINFO record and is used to sign in.
        Temporary password: <span className="tp-mono">123456</span>.
      </p>

      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--tp-absent-fg)" }}>
          {error}
        </p>
      )}

      <button
        className="tp-btn mt-4"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Adding..." : "Add faculty"}
      </button>
    </div>
  );
}
