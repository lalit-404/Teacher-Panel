import React from "react";
import { CalendarCheck, FileText, BookOpen, Settings } from "lucide-react";

export const SIDEBAR_ITEMS = [
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "papers", label: "My Papers", icon: FileText },
  { key: "classes", label: "Classes", icon: BookOpen },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="tp-card p-3 w-full lg:w-60 lg:shrink-0 teacher-sidebar">
      <div className="space-y-1 h-full flex flex-col">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className="tp-sidebar-btn"
              data-active={active === item.key}
              onClick={() => onSelect(item.key)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
