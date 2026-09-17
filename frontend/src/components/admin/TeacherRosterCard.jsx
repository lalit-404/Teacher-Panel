import React from "react";
import { Plus } from "lucide-react";
import TeacherRosterTable from "../tables/TeacherRosterTable";

export default function TeacherRosterCard({
  roster,
  onAddFaculty,
  pagination,
  onPrevPage,
  onNextPage,
}) {
  return (
    <div className="tp-card w-full">
      <div className="p-5 pb-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Teacher roster</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--tp-ink-soft)" }}>
            Today's punches, live from the machine
          </p>
        </div>
        <button className="tp-btn" onClick={onAddFaculty}>
          <Plus size={15} /> Add faculty
        </button>
      </div>
      <TeacherRosterTable roster={roster} />
      <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs" style={{ color: "var(--tp-ink-soft)" }}>
        <span>
          {pagination?.total
            ? `Showing ${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )} of ${pagination.total}`
            : "No teachers found"}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="tp-btn tp-btn-outline"
            style={{ fontSize: ".75rem", padding: ".35rem .7rem" }}
            onClick={onPrevPage}
            disabled={!pagination || pagination.page <= 1}
          >
            Previous
          </button>
          <span className="tp-mono">
            Page {pagination?.page || 1} of {pagination?.totalPages || 1}
          </span>
          <button
            className="tp-btn tp-btn-outline"
            style={{ fontSize: ".75rem", padding: ".35rem .7rem" }}
            onClick={onNextPage}
            disabled={!pagination || pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <div style={{ height: "1rem" }} />
    </div>
  );
}
