import React from "react";
import { STATUS_META } from "../../constants";

export default function StatusPill({ status }) {
  if (status === "weekend" || status === "upcoming") {
    return (
      <span className="tp-pill-plain">
        {status === "weekend" ? "Week off" : "—"}
      </span>
    );
  }
  const meta = STATUS_META[status];
  if (!meta) return <span className="tp-pill-plain">—</span>;
  return (
    <span
      className="tp-pill"
      style={{
        color: `var(--tp-${status}-fg)`,
        background: `var(--tp-${status}-bg)`,
      }}
    >
      {meta.label}
    </span>
  );
}
