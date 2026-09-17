import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import AttendanceHero from "../common/AttendanceHero";
import StatTile from "../common/StatTile";
import MonthNav from "../common/MonthNav";
import MonthlySummaryTable from "../tables/MonthlySummaryTable";
import { MONTH_NAMES } from "../../constants";

export default function MonthlySummaryCard({ year, month, rows, totals, onPrevMonth, onNextMonth }) {
  return (
    <div className="tp-card mt-5">
      <div className="p-5 pb-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="font-semibold">Monthly attendance summary</span>
          <p className="text-xs mt-0.5" style={{ color: "var(--tp-ink-soft)" }}>
            Present, absent, and late totals across all teachers
          </p>
        </div>
        <MonthNav label={`${MONTH_NAMES[month]} ${year}`} onPrev={onPrevMonth} onNext={onNextMonth} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
        <AttendanceHero
          title="Monthly attendance"
          pct={totals.attendancePct}
          subtext={`${totals.present + totals.late} of ${totals.workingDays} teacher-days attended`}
        />
        <StatTile icon={CheckCircle2} label="Present" value={totals.present} status="present" />
        <StatTile icon={Clock} label="Late" value={totals.late} status="late" />
        <StatTile icon={XCircle} label="Absent" value={totals.absent} status="absent" />
      </div>
      <MonthlySummaryTable rows={rows} />
      <div style={{ height: "1rem" }} />
    </div>
  );
}
