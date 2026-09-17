import React, { useEffect, useMemo, useState } from "react";
import DashboardHeader from "../layout/DashboardHeader";
import Sidebar, { SIDEBAR_ITEMS } from "../layout/Sidebar";
import ChangePasswordModal from "../auth/ChangePasswordModal";
import ComingSoon from "../common/ComingSoon";
import TeacherProfileCard from "./TeacherProfileCard";
import TodayCard from "./TodayCard";
import AttendanceChartCard from "./AttendanceChartCard";
import MonthNav from "../common/MonthNav";
import Pagination from "../common/Pagination";
import DailyLogTable from "../tables/DailyLogTable";
import AttendanceHero from "../common/AttendanceHero";
import StatTile from "../common/StatTile";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { MONTH_NAMES } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useClock } from "../../hooks/useClock";
import { useMonthNav } from "../../hooks/useMonthNav";
import { usePagination } from "../../hooks/usePagination";
import { fetchTeacherMonth } from "../../api/attendance";

export default function TeacherDashboard() {
  const { session, logout, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const teacher = session.user;
  const now = useClock();

  const [activeTab, setActiveTab] = useState("attendance");
  const [showPwdModal, setShowPwdModal] = useState(!!teacher.mustChangePassword);
  const { viewYear, viewMonth, goMonth } = useMonthNav(now);

  const [monthData, setMonthData] = useState(null); // { days, summary, todayKey }
  const [todayEntry, setTodayEntry] = useState(null);
  const [error, setError] = useState("");

  // Daily log + chart for the navigated month.
  useEffect(() => {
    let cancelled = false;
    fetchTeacherMonth(teacher.id, viewYear, viewMonth)
      .then((data) => !cancelled && setMonthData(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [teacher.id, viewYear, viewMonth]);

  // "Today" card always reflects the current month, independent of navigation.
  useEffect(() => {
    let cancelled = false;
    fetchTeacherMonth(teacher.id, now.getFullYear(), now.getMonth())
      .then((data) => !cancelled && setTodayEntry(data.todayEntry))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher.id, now.toDateString()]);

  const sortedDays = useMemo(() => (monthData ? [...monthData.days].reverse() : []), [monthData]);
  const { page, totalPages, pageItems, next, prev } = usePagination(
    sortedDays,
    7,
    `${viewYear}-${viewMonth}`
  );

  const timeLabel = now.toLocaleTimeString("en-IN", { hour12: true });
  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleChangePassword(pwd) {
    await changePassword(pwd);
    setShowPwdModal(false);
  }

  if (!monthData) {
    return (
      <div className={`tp-root ${theme}`} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--tp-ink-soft)" }}>Loading your dashboard…</p>
      </div>
    );
  }

  const summary = monthData.summary;
  const activeLabel = SIDEBAR_ITEMS.find((i) => i.key === activeTab)?.label || "";

  return (
    <div className={`tp-root ${theme}`}>
      {showPwdModal && <ChangePasswordModal onSubmit={handleChangePassword} />}
      <div className="w-full max-w-none" style={{ padding: "1.5rem clamp(1rem, 3vw, 2.5rem)" }}>
        <DashboardHeader
          subtitle="Teacher dashboard"
          timeLabel={timeLabel}
          dateLabel={dateLabel}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={logout}
        />

        {error && (
          <div className="tp-card p-3 mb-5 text-sm" style={{ color: "var(--tp-absent-fg)" }}>
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch teacher-dashboard-layout">
          <Sidebar active={activeTab} onSelect={setActiveTab} />

          <div className="flex-1 min-w-0">
            {activeTab !== "attendance" ? (
              <ComingSoon label={activeLabel} />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
                  <TeacherProfileCard teacher={teacher} />
                  <TodayCard todayEntry={todayEntry} />

                  <div className="lg:col-span-4">
                    <div className="mb-3">
                      <AttendanceHero
                        title="Attendance this month"
                        pct={summary.pct}
                        subtext={`${summary.present + summary.late} of ${summary.workingDays} working days`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <StatTile icon={CheckCircle2} label="Present" value={summary.present} status="present" />
                      </div>
                      <StatTile icon={Clock} label="Late" value={summary.late} status="late" />
                      <StatTile icon={XCircle} label="Absent" value={summary.absent} status="absent" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="tp-card lg:col-span-2">
                    <div className="p-5 pb-0 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="font-semibold">Daily log</span>
                        <p className="text-xs mt-0.5" style={{ color: "var(--tp-ink-soft)" }}>Latest 7 days first</p>
                      </div>
                      <MonthNav
                        label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
                        onPrev={() => goMonth(-1)}
                        onNext={() => goMonth(1)}
                      />
                    </div>
                    <DailyLogTable days={pageItems} todayKey={monthData.todayKey} />
                    <Pagination page={page} totalPages={totalPages} onPrev={prev} onNext={next} />
                  </div>

                  <AttendanceChartCard days={monthData.days} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
