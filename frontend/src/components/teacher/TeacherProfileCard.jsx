import React from "react";
import { initials } from "../../utils/format";

export default function TeacherProfileCard({ teacher }) {
  return (
    <div className="tp-card lg:col-span-4">
      <div className="tp-accent-bar" />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: "var(--tp-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
            }}
          >
            {initials(teacher.name)}
          </div>
          <div>
            <div className="font-semibold text-lg leading-tight">{teacher.name}</div>
            <div className="text-sm" style={{ color: "var(--tp-ink-soft)" }}>
              {teacher.subject} Teacher
            </div>
          </div>
        </div>
        <div
          className="mt-4 pt-4 text-sm space-y-1.5"
          style={{ borderTop: "1px solid var(--tp-border)", color: "var(--tp-ink-soft)" }}
        >
          <div className="flex justify-between">
            <span>Staff ID</span>
            <span className="tp-mono" style={{ color: "var(--tp-ink)" }}>{teacher.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Department</span>
            <span style={{ color: "var(--tp-ink)" }}>{teacher.subject}</span>
          </div>
          <div className="flex justify-between">
            <span>Joined</span>
            <span style={{ color: "var(--tp-ink)" }}>{teacher.joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
