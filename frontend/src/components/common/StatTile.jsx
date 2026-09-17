import React from "react";

/**
 * status maps to the shared colour variables (present=green, late=yellow,
 * absent=red) so the icon and number match the StatusPill colours
 * used everywhere else. Falls back to the teal brand colour when no status
 * is given (e.g. generic tiles that aren't attendance-related).
 */
export default function StatTile({ icon: Icon, label, value, status }) {
  const color = status ? `var(--tp-${status}-fg)` : "var(--tp-primary)";
  return (
    <div className="tp-tile">
      <Icon size={18} strokeWidth={1.75} style={{ color }} />
      <div className="tp-tile-value" style={{ color }}>
        {value}
      </div>
      <div className="tp-tile-label">{label}</div>
    </div>
  );
}
