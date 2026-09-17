import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--tp-border)" }}>
      <span className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>
        Page {page + 1} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button className="tp-nav-btn" disabled={page === 0} onClick={onPrev}>
          <ChevronLeft size={16} />
        </button>
        <button className="tp-nav-btn" disabled={page >= totalPages - 1} onClick={onNext}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
