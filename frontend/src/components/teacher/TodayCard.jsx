import React from "react";
import StatusPill from "../common/StatusPill";
import { minutesToLabel } from "../../utils/format";

export default function TodayCard({ todayEntry }) {
  if (!todayEntry) return null;

  return (
    <div className="tp-card lg:col-span-4 p-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Today</span>
        <StatusPill status={todayEntry.status} />
      </div>
      <div className="flex items-center gap-6 mt-4">
        <div>
          <div className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>Punch in</div>
          <div className="tp-mono text-lg font-medium">{minutesToLabel(todayEntry.inMin)}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>Punch out</div>
          <div className="tp-mono text-lg font-medium">{minutesToLabel(todayEntry.outMin)}</div>
        </div>
      </div>
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--tp-border)" }}>
        {todayEntry.holidayName ? (
          <p className="text-sm" style={{ color: "var(--tp-muted)" }}>{todayEntry.holidayName} — school closed.</p>
        ) : todayEntry.status === "weekend" ? (
          <p className="text-sm" style={{ color: "var(--tp-muted)" }}>Week off — no punches expected.</p>
        ) : todayEntry.status === "absent" ? (
          <p className="text-sm" style={{ color: "var(--tp-muted)" }}>No punch recorded today.</p>
        ) : (
          <p className="text-xs flex items-center" style={{ color: "var(--tp-muted)" }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: 9999, background: "var(--tp-present-fg)",
                display: "inline-block", marginRight: "0.4rem",
              }}
            />
            Synced from the punching machine
          </p>
        )}
      </div>
    </div>
  );
}
