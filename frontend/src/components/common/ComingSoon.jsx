import React from "react";
import { Hammer } from "lucide-react";

export default function ComingSoon({ label }) {
  return (
    <div className="tp-card p-10 text-center teacher-coming-soon">
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          background: "var(--tp-primary-soft)",
          color: "var(--tp-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 0.9rem",
        }}
      >
        <Hammer size={20} />
      </div>
      <p className="font-medium">{label}</p>
      <p className="text-sm mt-1" style={{ color: "var(--tp-ink-soft)" }}>
        This section is coming soon.
      </p>
    </div>
  );
}
