# Teacher Panel - Frontend

React + Vite frontend for the Teacher Panel attendance dashboard, split into small,
reusable components and wired to the backend API (see `../backend`).

## Structure
```
src/
  api/            fetch wrappers, one file per backend resource
  components/
    common/       generic building blocks (buttons, pills, modal, stat tiles...)
    tables/       DailyLogTable, TeacherRosterTable, MonthlySummaryTable
    leave/        LeaveRequestsPanel
    auth/         LoginPage, RoleToggle, ChangePasswordModal
    faculty/      AddFacultyModal, ManualFacultyForm
    layout/       DashboardHeader (shared by both dashboards)
    teacher/      TeacherDashboard + its cards (profile, today, leave balance)
    admin/        AdminDashboard + its cards (roster, leave requests, monthly summary)
  context/        AuthContext (session/token), ThemeContext (light/dark)
  hooks/          useClock, useMonthNav, usePagination
  utils/          format.js (pad/minutesToLabel/initials), csv.js (parseCsv)
  constants/      MONTH_NAMES, DAY_ABBR, STATUS_META
  styles/         global.css (design tokens + tp-* classes), tailwind.css
```

## Setup
```bash
cd frontend
npm install
cp .env.example .env    # points VITE_API_URL at the backend
npm run dev
```
Runs on `http://localhost:5173`. Make sure the backend (`../backend`) is running on the URL
set in `.env` (defaults to `http://localhost:4000/api`).

## Login (matches the seeded backend data)
There's a single login form - no admin/teacher toggle. The backend decides where you land based
on the email you enter:
- Enter `admin` as the email with password `admin123` (see `backend/.env.example`) -> admin console.
- Enter any seeded teacher's email (e.g. `aditya.sharma@teacherpanel.edu`) with password `123456`
  -> teacher dashboard. New faculty added through the admin console use the same default password
  and are prompted to set a new one on first login.
- A teacher flagged as a co-admin lands in the admin console automatically, using their own email
  and password.

## Status colours (shared by both dashboards)
Present = green, Late = yellow, Absent = red, On leave = blue. Defined once as CSS variables in
`src/styles/global.css` (`--tp-present-*`, `--tp-late-*`, `--tp-absent-*`, `--tp-leave-*`) and
applied to every `StatusPill` and `StatTile` (pass a `status` prop) in both `AdminDashboard` and
`TeacherDashboard`, so they stay in sync automatically.

## Teacher dashboard sidebar
The teacher view has a left sidebar (`components/layout/Sidebar.jsx`) with Attendance, My Papers,
Classes, Leave, and Settings.
- **Attendance** - the existing profile/today/summary/log view, plus a punch-in-times chart.
- **Leave** (`components/teacher/LeaveSection.jsx`) - a real leave-request workflow: the teacher
  picks a type, date range, and reason, which posts to the backend and lands in the admin's
  "Leave requests" panel. The same screen also lists the teacher's own requests with a live
  status badge (pending/approved/declined) that reflects whatever the admin decided - refreshed
  automatically when the tab opens, or via the refresh button.
- **My Papers / Classes / Settings** - still `ComingSoon` placeholders; wire these up to real data
  when those features are built.

The old casual/sick/earned leave balance card has been replaced with `AttendanceChartCard.jsx`, a
`recharts` bar chart of the teacher's daily punch-in times for the selected month, colour-coded
green (on time) / yellow (late).

## Notes
- All attendance numbers are generated deterministically by the backend (same algorithm as the
  original single-file prototype), so the same day always produces the same "punches" until the
  backend's in-memory store is restarted.
- Swap the `api/*.js` modules for a different backend without touching any component.
