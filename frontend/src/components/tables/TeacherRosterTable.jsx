import React from "react";
import StatusPill from "../common/StatusPill";
import { minutesToLabel } from "../../utils/format";

export default function TeacherRosterTable({ roster }) {
  return (
    <div className="tp-scroll" style={{ overflowX: "auto" }}>
      <table className="w-full text-sm mt-3" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--tp-ink-soft)", borderBottom: "1px solid var(--tp-border)" }}>
            <th className="text-left font-medium py-2 px-5">Name</th>
            <th className="text-left font-medium py-2 px-3">Subject</th>
            <th className="text-left font-medium py-2 px-3">Punch in</th>
            <th className="text-left font-medium py-2 px-3">Punch out</th>
            <th className="text-left font-medium py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((t) => (
            <tr key={t.id} className="tp-table-row" style={{ borderBottom: "1px solid var(--tp-border)" }}>
              <td className="py-2 px-5">
                <div className="flex items-center gap-2">
                  <span>{t.name}</span>
                  {t.isAdmin && (
                    <span className="tp-pill" style={{ color: "var(--tp-primary)", background: "var(--tp-primary-soft)" }}>
                      Admin
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2 px-3" style={{ color: "var(--tp-ink-soft)" }}>{t.subject}</td>
              <td className="py-2 px-3 tp-mono">{minutesToLabel(t.inMin)}</td>
              <td className="py-2 px-3 tp-mono">{minutesToLabel(t.outMin)}</td>
              <td className="py-2 px-3">
                <StatusPill status={t.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
