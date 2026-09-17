import React from "react";
import StatusPill from "../common/StatusPill";
import { DAY_ABBR } from "../../constants";
import { pad, minutesToLabel } from "../../utils/format";

export default function DailyLogTable({ days, todayKey }) {
  return (
    <div className="tp-scroll" style={{ overflowX: "auto" }}>
      <table className="w-full text-sm mt-3" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--tp-ink-soft)", borderBottom: "1px solid var(--tp-border)" }}>
            <th className="text-left font-medium py-2 px-5">Date</th>
            <th className="text-left font-medium py-2 px-3">Punch in</th>
            <th className="text-left font-medium py-2 px-3">Punch out</th>
            <th className="text-left font-medium py-2 px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr
              key={d.key}
              className={`tp-table-row ${d.key === todayKey ? "is-today" : ""}`}
              style={{ borderBottom: "1px solid var(--tp-border)" }}
            >
              <td className="py-2 px-5">
                <span className="tp-mono">{pad(d.day)}</span>{" "}
                <span style={{ color: "var(--tp-muted)" }}>{DAY_ABBR[d.dow]}</span>
              </td>
              <td className="py-2 px-3 tp-mono">{minutesToLabel(d.inMin)}</td>
              <td className="py-2 px-3 tp-mono">{minutesToLabel(d.outMin)}</td>
              <td className="py-2 px-5">
                <StatusPill status={d.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
