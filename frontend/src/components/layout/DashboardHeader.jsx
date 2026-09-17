import React from "react";
import { LogOut, Search } from "lucide-react";
import Brand from "../common/Brand";
import ThemeToggle from "../common/ThemeToggle";

export default function DashboardHeader({
  subtitle,
  timeLabel,
  dateLabel,
  theme,
  onToggleTheme,
  onLogout,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search teachers by ID or name",
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <Brand subtitle={subtitle} />
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {onSearchChange && (
          <div
            className="tp-card flex items-center gap-2"
            style={{ padding: ".45rem .7rem", minWidth: "260px" }}
          >
            <Search size={16} style={{ color: "var(--tp-ink-soft)" }} />
            <input
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              style={{
                border: "0",
                outline: "0",
                background: "transparent",
                color: "var(--tp-ink)",
                width: "100%",
                minWidth: 0,
                fontSize: ".85rem",
              }}
            />
          </div>
        )}
        <div className="text-right">
          <div className="tp-mono font-semibold" style={{ fontSize: "1.2rem" }}>
            {timeLabel}
          </div>
          <div className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>
            {dateLabel}
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button className="tp-btn tp-btn-ghost" onClick={onLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}
