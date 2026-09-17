import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, maxWidth }) {
  return (
    <div className="tp-modal-overlay">
      <div className="tp-modal" style={maxWidth ? { maxWidth } : undefined}>
        <div className="tp-modal-header">
          <span className="font-semibold">{title}</span>
          {onClose && (
            <button className="tp-nav-btn" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="tp-modal-body">{children}</div>
      </div>
    </div>
  );
}
