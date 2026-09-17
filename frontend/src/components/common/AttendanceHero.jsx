import React from "react";

export default function AttendanceHero({ title, pct, subtext, wide }) {
  return (
    <div className="tp-card p-4" style={wide ? { gridColumn: "span 2 / span 2" } : undefined}>
      <div className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>
        {title}
      </div>
      <div className="tp-mono font-semibold" style={{ fontSize: "2rem", color: "var(--tp-primary-dark)" }}>
        {pct}%
      </div>
      <div className="text-xs" style={{ color: "var(--tp-muted)" }}>
        {subtext}
      </div>
    </div>
  );
}
