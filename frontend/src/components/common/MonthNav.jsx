import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthNav({ label, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <button className="tp-nav-btn" onClick={onPrev}>
        <ChevronLeft size={16} />
      </button>
      <span className="tp-mono text-sm w-28 text-center inline-block">{label}</span>
      <button className="tp-nav-btn" onClick={onNext}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
