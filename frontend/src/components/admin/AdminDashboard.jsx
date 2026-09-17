import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Coffee, X } from "lucide-react";
import DashboardHeader from "../layout/DashboardHeader";
import AttendanceHero from "../common/AttendanceHero";
import StatTile from "../common/StatTile";
import TeacherRosterCard from "./TeacherRosterCard";
import MonthlySummaryCard from "./MonthlySummaryCard";
import AddFacultyModal from "../faculty/AddFacultyModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useClock } from "../../hooks/useClock";
import { useMonthNav } from "../../hooks/useMonthNav";
import { fetchTodayRoster, fetchMonthlySummary } from "../../api/attendance";
import { addTeacher } from "../../api/teachers";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const now = useClock();

  const [rosterData, setRosterData] = useState(null); // { roster, stats, dayInfo, todayKey, pagination }
  const [error, setError] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const teacherPageSize = 10;

  function handleTeacherSearch(value) {
    setTeacherSearch(value);
    setTeacherPage(1);
  }

  const { viewYear: mYear, viewMonth: mMonth, goMonth: goMonthlyMonth } = useMonthNav(now);
  const [monthlyData, setMonthlyData] = useState(null); // { rows, totals }

  const [showAddModal, setShowAddModal] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  function loadRoster() {
    return fetchTodayRoster({
      search: teacherSearch,
      page: teacherPage,
      pageSize: teacherPageSize,
    })
      .then(setRosterData)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoster();
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherSearch, teacherPage]);

  useEffect(() => {
    fetchMonthlySummary(mYear, mMonth)
      .then(setMonthlyData)
      .catch((err) => setError(err.message));
  }, [mYear, mMonth]);

  async function handleAddManual(input) {
    const record = await addTeacher(input);
    setShowAddModal(false);
    setJustAdded({ count: 1, first: record });
    await loadRoster();
  }

  const timeLabel = now.toLocaleTimeString("en-IN", { hour12: true });
  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!rosterData || !monthlyData) {
    return (
      <div className={`tp-root ${theme}`} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--tp-ink-soft)" }}>Loading the admin console…</p>
      </div>
    );
  }

  const { roster, stats, dayInfo, pagination } = rosterData;

  return (
    <div className={`tp-root ${theme}`}>
      {showAddModal && (
        <AddFacultyModal
          onClose={() => setShowAddModal(false)}
          onAddManual={handleAddManual}
        />
      )}

      <div className="w-full max-w-none" style={{ padding: "1.5rem clamp(1rem, 3vw, 2.5rem)" }}>
        <DashboardHeader
          subtitle="Admin console"
          timeLabel={timeLabel}
          dateLabel={dateLabel}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={logout}
          searchValue={teacherSearch}
          onSearchChange={handleTeacherSearch}
        />

        {error && (
          <div className="tp-card p-3 mb-5 text-sm" style={{ color: "var(--tp-absent-fg)" }}>
            {error}
          </div>
        )}

        {justAdded && (
          <div className="tp-card p-4 mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} style={{ color: "var(--tp-present-fg)" }} />
              <div>
                <div className="font-medium text-sm">
                  {justAdded.count === 1 ? `${justAdded.first.name} added` : `${justAdded.count} faculty added`}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--tp-ink-soft)" }}>
                  ID: {justAdded.first.id} · Temporary password: 123456. They&apos;ll be asked to set a new password on first login.
                </div>
              </div>
            </div>
            <button className="tp-nav-btn" onClick={() => setJustAdded(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {dayInfo ? (
          <div className="tp-card p-4 mb-5 flex items-center gap-3">
            <Coffee size={20} style={{ color: "var(--tp-primary)" }} />
            <div>
              <div className="font-medium text-sm">{dayInfo.type === "holiday" ? dayInfo.name : "Week off"}</div>
              <div className="text-xs" style={{ color: "var(--tp-ink-soft)" }}>
                No attendance is expected from staff today.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full items-stretch">
            <AttendanceHero
              title="Staff attendance today"
              pct={stats.attendancePct}
              subtext={`${stats.attendedCount} of ${stats.totalTeachers} teachers present`}
            />
            <StatTile icon={CheckCircle2} label="Present" value={stats.presentCount} status="present" />
            <StatTile icon={Clock} label="Late" value={stats.lateCount} status="late" />
            <StatTile icon={XCircle} label="Absent" value={stats.absentCount} status="absent" />
          </div>
        )}

        <div className="w-full mb-6">
          <TeacherRosterCard
            roster={roster}
            onAddFaculty={() => setShowAddModal(true)}
            pagination={pagination}
            onPrevPage={() => setTeacherPage((p) => Math.max(1, p - 1))}
            onNextPage={() =>
              setTeacherPage((p) => Math.min(pagination?.totalPages || 1, p + 1))
            }
          />
        </div>

        <MonthlySummaryCard
          year={mYear}
          month={mMonth}
          rows={monthlyData.rows}
          totals={monthlyData.totals}
          onPrevMonth={() => goMonthlyMonth(-1)}
          onNextMonth={() => goMonthlyMonth(1)}
        />
      </div>
    </div>
  );
}
