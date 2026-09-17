import React from "react";

export default function LabeledInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block text-sm">
      <span style={{ color: "var(--tp-ink-soft)" }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="tp-plain-input"
      />
    </label>
  );
}
