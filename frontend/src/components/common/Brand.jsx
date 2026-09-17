import React from "react";
import { GraduationCap } from "lucide-react";

export default function Brand({ subtitle, center }) {
  return (
    <div className={`flex items-center gap-2.5 ${center ? "justify-center" : ""}`}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "var(--tp-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <GraduationCap size={18} />
      </div>
      <div>
        <div className="font-semibold" style={{ fontSize: "1.05rem", lineHeight: 1.1 }}>
          Teacher Panel
        </div>
        {subtitle && (
          <div style={{ fontSize: "0.72rem", color: "var(--tp-ink-soft)" }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
