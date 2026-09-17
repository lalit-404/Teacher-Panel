const store = require("../data/store");
const { todayKeyFor, buildMonth, dayTypeFor, summarizeMonth } = require("../utils/attendance");

function parseYearMonth(req, fallbackDate) {
  const year = req.query.year ? parseInt(req.query.year, 10) : fallbackDate.getFullYear();
  const month = req.query.month ? parseInt(req.query.month, 10) : fallbackDate.getMonth();

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) {
    throw Object.assign(new Error("Invalid year/month"), { status: 400 });
  }
  return { year, month };
}

function safeTeacher(t) {
  if (!t) return null;
  const { password, ...safe } = t;
  return safe;
}

async function teacherMonth(req, res, next) {
  try {
    const teacher = await store.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const now = new Date();
    const todayKey = todayKeyFor(now);
    const { year, month } = parseYearMonth(req, now);
    const records = await store.getAttendanceForTeacher(teacher.id, year, month);
    const days = buildMonth(year, month, todayKey, records);
    res.json({
      year,
      month,
      todayKey,
      days,
      summary: summarizeMonth(days),
      todayEntry: days.find((d) => d.key === todayKey) || null
    });
  } catch (err) {
    next(err);
  }
}

async function today(req, res, next) {
  try {
    const now = new Date();
    const todayKey = todayKeyFor(now);
    const [teachers, records] = await Promise.all([
      store.getTeachers(),
      store.getTodayAttendance(todayKey)
    ]);

    const byTeacher = new Map(records.map((r) => [r.id.toLowerCase(), r]));
    const dayInfo = dayTypeFor(now);

    // Search and pagination are applied on the admin roster in memory so
    // Access does not need unsupported parameter metadata or complex SQL.
    const search = String(req.query.search || "").trim().toLowerCase();
    const requestedPage = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const requestedPageSize = parseInt(req.query.pageSize || "10", 10) || 10;
    const pageSize = Math.min(100, Math.max(1, requestedPageSize));

    const allRoster = teachers.map((t) => {
      if (dayInfo) {
        return { ...safeTeacher(t), status: dayInfo.type, inMin: null, outMin: null };
      }
      const record = byTeacher.get(t.id.toLowerCase());
      return {
        ...safeTeacher(t),
        status: record?.status || "absent",
        inMin: record?.inMin ?? null,
        outMin: record?.outMin ?? null
      };
    });

    const filteredRoster = search
      ? allRoster.filter((teacher) => {
          const name = String(teacher.name || "").toLowerCase();
          const id = String(teacher.id || "").toLowerCase();
          return name.includes(search) || id.includes(search);
        })
      : allRoster;

    const totalTeachers = allRoster.length;
    const filteredTotal = filteredRoster.length;
    const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const start = (page - 1) * pageSize;
    const roster = filteredRoster.slice(start, start + pageSize);
    const presentCount = roster.filter((t) => t.status === "present").length;
    const lateCount = roster.filter((t) => t.status === "late").length;
    const absentCount = roster.filter((t) => t.status === "absent").length;
    const attendedCount = presentCount + lateCount;
    const attendancePct = totalTeachers
      ? Math.round((attendedCount / totalTeachers) * 100)
      : 0;

    res.json({
      todayKey,
      dayInfo,
      roster,
      pagination: {
        page,
        pageSize,
        total: filteredTotal,
        totalPages,
        search
      },
      stats: {
        totalTeachers,
        presentCount,
        lateCount,
        absentCount,
        attendedCount,
        attendancePct
      }
    });
  } catch (err) {
    next(err);
  }
}

async function monthlySummary(req, res, next) {
  try {
    const now = new Date();
    const todayKey = todayKeyFor(now);
    const { year, month } = parseYearMonth(req, now);
    const teachers = await store.getTeachers();

    const rows = [];
    for (const teacher of teachers) {
      const records = await store.getAttendanceForTeacher(teacher.id, year, month);
      const days = buildMonth(year, month, todayKey, records);
      rows.push({ ...safeTeacher(teacher), ...summarizeMonth(days) });
    }

    const totals = rows.reduce((acc, row) => {
      acc.present += row.present;
      acc.late += row.late;
      acc.absent += row.absent;
      acc.workingDays += row.workingDays;
      return acc;
    }, { present: 0, late: 0, absent: 0, workingDays: 0 });

    const attendancePct = totals.workingDays
      ? Math.round(((totals.present + totals.late) / totals.workingDays) * 100)
      : 0;

    res.json({ year, month, rows, totals: { ...totals, attendancePct } });
  } catch (err) {
    next(err);
  }
}

module.exports = { teacherMonth, today, monthlySummary };
