import React from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="tp-nav-btn" onClick={onToggle} title="Toggle theme">
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
