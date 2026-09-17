import React from "react";

export default function MonthlySummaryTable({ rows }) {
  return (
    <div className="tp-scroll" style={{ overflowX: "auto" }}>
      <table className="w-full text-sm mt-3" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--tp-ink-soft)", borderBottom: "1px solid var(--tp-border)" }}>
            <th className="text-left font-medium py-2 px-5">Teacher</th>
            <th className="text-left font-medium py-2 px-3">Subject</th>
            <th className="text-left font-medium py-2 px-3">Present</th>
            <th className="text-left font-medium py-2 px-3">Late</th>
            <th className="text-left font-medium py-2 px-3">Absent</th>
            <th className="text-left font-medium py-2 px-5">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="tp-table-row" style={{ borderBottom: "1px solid var(--tp-border)" }}>
              <td className="py-2 px-5">{r.name}</td>
              <td className="py-2 px-3" style={{ color: "var(--tp-ink-soft)" }}>{r.subject}</td>
              <td className="py-2 px-3 tp-mono">{r.present}</td>
              <td className="py-2 px-3 tp-mono">{r.late}</td>
              <td className="py-2 px-3 tp-mono">{r.absent}</td>
              <td className="py-2 px-5 tp-mono">{r.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
