const {
  query,
  mapTeacher,
  mapAttendance,
  getField,
  findColumn,
  sqlText,
  sqlNumber,
  sqlBoolean,
  bracket,
  accessDateLiteral,
  toDateKey,
  timeToMinutes,
  USERINFO_FIELDS,
} = require("./access");

const USERINFO_TABLE = "USERINFO";
const CHECKINOUT_TABLE = "CHECKINOUT";

let userInfoSamplePromise = null;

async function getUserInfoSample() {
  if (!userInfoSamplePromise) {
    userInfoSamplePromise = query(`SELECT TOP 1 * FROM [${USERINFO_TABLE}]`)
      .then((rows) => {
        if (!rows.length) {
          throw new Error("USERINFO table is empty.");
        }
        return rows[0];
      })
      .catch((err) => {
        userInfoSamplePromise = null;
        throw err;
      });
  }
  return userInfoSamplePromise;
}

function usefulUserInfoColumns(sample) {
  // These are the faculty fields used by the application. They map directly
  // to the existing Access USERINFO columns.
  const groups = [
    [USERINFO_FIELDS.id, "User ID", "UserId"],
    [USERINFO_FIELDS.loginId, "BadgeNumber", "Badge Number"],
    [USERINFO_FIELDS.name, "User Name", "Full Name"],
    [USERINFO_FIELDS.gender, "GENDER", "Sex"],
    [USERINFO_FIELDS.password, "Password", "Login Password"],
    ["IsAdmin", "Is Admin", "Admin", "Is Administrator"],
  ];

  const result = [];
  for (const aliases of groups) {
    const actual = findColumn(sample, aliases);
    if (actual && !result.includes(actual)) result.push(actual);
  }
  return result;
}

async function getTeachers() {
  const sample = await getUserInfoSample();
  const columns = usefulUserInfoColumns(sample);

  if (!columns.length) {
    throw new Error("No usable teacher fields were found in USERINFO.");
  }

  const rows = await query(
    `SELECT ${columns.map(bracket).join(", ")} FROM [${USERINFO_TABLE}]`
  );

  return rows.map(mapTeacher).filter((teacher) => teacher.name);
}

async function getTeacherById(id) {
  const wanted = String(id).trim().toLowerCase();
  const teachers = await getTeachers();
  return (
    teachers.find((teacher) => teacher.id.toLowerCase() === wanted) || null
  );
}

async function findTeacherByLogin(identifier) {
  const wanted = String(identifier || "").trim().toLowerCase();
  const teachers = await getTeachers();

  return (
    teachers.find((teacher) =>
      [teacher.username, teacher.email, teacher.phone, teacher.id].some(
        (value) => String(value || "").toLowerCase() === wanted
      )
    ) || null
  );
}

async function addTeacher(input) {
  const name = String(input.name || "").trim();
  const id = String(input.id || "").trim();
  const gender = String(input.gender || "").trim();

  if (!name) {
    throw Object.assign(new Error("Faculty name is required"), { status: 400 });
  }
  if (!id) {
    throw Object.assign(new Error("Faculty ID is required"), { status: 400 });
  }
  if (!/^\d+$/.test(id)) {
    throw Object.assign(new Error("Faculty ID must contain only numbers."), { status: 400 });
  }
  if (!gender) {
    throw Object.assign(new Error("Gender is required"), { status: 400 });
  }

  const sample = await getUserInfoSample();
  const idColumn = findColumn(sample, [USERINFO_FIELDS.id, "User ID", "UserId"]);
  const badgeColumn = findColumn(sample, [USERINFO_FIELDS.loginId, "BadgeNumber", "Badge Number"]);
  const nameColumn = findColumn(sample, [USERINFO_FIELDS.name, "User Name", "Full Name"]);
  const genderColumn = findColumn(sample, [USERINFO_FIELDS.gender, "GENDER", "Sex"]);

  if (!idColumn || !nameColumn || !genderColumn) {
    throw new Error("USERINFO is missing one of the required columns: USERID, Name, Gender.");
  }

  const numericId = Number(id);
  const existing = await getTeachers();
  const duplicate = existing.find(
    (teacher) =>
      String(teacher.id) === String(numericId) ||
      String(teacher.username || "") === id
  );
  if (duplicate) {
    throw Object.assign(new Error(`Faculty ID ${id} already exists.`), { status: 409 });
  }

  const fields = [bracket(idColumn), bracket(nameColumn), bracket(genderColumn)];
  const values = [sqlNumber(numericId), sqlText(name), sqlText(gender)];

  // Keep the badge/login ID synchronized with the faculty ID when the
  // Access database has the Badgenumber field.
  if (badgeColumn && !fields.includes(bracket(badgeColumn))) {
    fields.push(bracket(badgeColumn));
    values.push(sqlText(id));
  }

  const passwordColumn = findColumn(sample, [USERINFO_FIELDS.password, "Password", "Login Password"]);
  if (passwordColumn) {
    fields.push(bracket(passwordColumn));
    values.push(sqlText(process.env.DEFAULT_TEACHER_PASSWORD || "123456"));
  }

  await query(
    `INSERT INTO [${USERINFO_TABLE}] (${fields.join(", ")}) VALUES (${values.join(", ")})`
  );

  return getTeacherById(String(numericId));
}

/*
 * Password changes are supported only when the corresponding optional
 * USERINFO password column exists.
 */
async function updateTeacher(id, patch) {
  const teacher = await getTeacherById(id);
  if (!teacher) return null;

  const sample = await getUserInfoSample();
  const idColumn = findColumn(sample, [USERINFO_FIELDS.id, "User ID", "UserId"]);
  if (!idColumn) throw new Error("USERINFO has no USERID column.");

  const fields = [];

  if (Object.prototype.hasOwnProperty.call(patch, "password")) {
    const actual = findColumn(sample, [USERINFO_FIELDS.password, "Password", "Login Password"]);
    if (actual) fields.push(`${bracket(actual)} = ${sqlText(patch.password)}`);
  }

  if (fields.length) {
    const idValue = Number.isFinite(Number(id))
      ? sqlNumber(id)
      : sqlText(id);

    await query(
      `UPDATE [${USERINFO_TABLE}] SET ${fields.join(", ")} WHERE ${bracket(
        idColumn
      )} = ${idValue}`
    );
  }

  return getTeacherById(id);
}

/*
 * CHECKINOUT contains many biometric-device fields. We deliberately use
 * ONLY USERID and CHECKTIME.
 *
 * For each USERID + calendar date:
 *   MIN(CHECKTIME) = check-in
 *   MAX(CHECKTIME) = check-out
 *
 * No SensorID, WorkCode, CHECKTYPE, VERIFYCODE, sn, etc. are used.
 */
async function getAttendanceForTeacher(teacherId, year, month) {
  const firstMonth = month + 1;
  const nextDate = new Date(year, month + 1, 1);
  const nextMonth = nextDate.getMonth() + 1;
  const nextYear = nextDate.getFullYear();

  const startLiteral = accessDateLiteral(year, firstMonth, 1);
  const nextLiteral = accessDateLiteral(nextYear, nextMonth, 1);

  const numericId = Number(teacherId);
  const userIdSql = Number.isFinite(numericId)
    ? sqlNumber(numericId)
    : sqlText(teacherId);

  // Do NOT use Access GROUP BY/DateValue/Format here. Some Access ODBC
  // installations return malformed object errors for those expressions.
  // Read only the two useful biometric fields and group the punches in JS.
  const rows = await query(`
    SELECT [USERID], [CHECKTIME]
    FROM [${CHECKINOUT_TABLE}]
    WHERE [USERID] = ${userIdSql}
      AND [CHECKTIME] >= ${startLiteral}
      AND [CHECKTIME] < ${nextLiteral}
    ORDER BY [CHECKTIME] ASC
  `);

  const byDate = new Map();

  for (const row of rows) {
    const dateValue = getField(row, ["CHECKTIME", "CheckTime"]);
    const dateKey = toDateKey(dateValue);
    if (!dateKey) continue;

    const timeValue = timeToMinutes(dateValue);
    if (timeValue == null) continue;

    const existing = byDate.get(dateKey);
    if (!existing) {
      byDate.set(dateKey, {
        dateKey,
        inMin: timeValue,
        outMin: null
      });
    } else {
      // Rows are ordered ASC, but explicitly keep min/max so the result
      // remains correct even if the driver ignores ORDER BY.
      existing.inMin = Math.min(existing.inMin, timeValue);
      existing.outMin =
        existing.outMin == null
          ? timeValue
          : Math.max(existing.outMin, timeValue);
    }
  }

  return [...byDate.values()]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((record) => ({
      ...record,
      status: record.inMin > 585 ? "late" : "present",
      leaveType: null,
      holidayName: null
    }));
}

async function getTodayAttendance(todayKey) {
  const [year, month, day] = todayKey.split("-").map(Number);
  const startLiteral = accessDateLiteral(year, month, day);
  const nextDate = new Date(year, month - 1, day + 1);
  const nextLiteral = accessDateLiteral(
    nextDate.getFullYear(),
    nextDate.getMonth() + 1,
    nextDate.getDate()
  );

  // Read only USERID and CHECKTIME. First/last punch per teacher is
  // calculated in JavaScript to avoid Access expression/driver issues.
  const rows = await query(`
    SELECT [USERID], [CHECKTIME]
    FROM [${CHECKINOUT_TABLE}]
    WHERE [CHECKTIME] >= ${startLiteral}
      AND [CHECKTIME] < ${nextLiteral}
    ORDER BY [USERID], [CHECKTIME] ASC
  `);

  const byTeacher = new Map();

  for (const row of rows) {
    const idValue = getField(row, ["USERID", "UserId", "User ID"]);
    const id = String(idValue ?? "").trim();
    if (!id) continue;

    const dateValue = getField(row, ["CHECKTIME", "CheckTime"]);
    const dateKey = toDateKey(dateValue);
    if (dateKey !== todayKey) continue;

    const timeValue = timeToMinutes(dateValue);
    if (timeValue == null) continue;

    const key = id.toLowerCase();
    const existing = byTeacher.get(key);

    if (!existing) {
      byTeacher.set(key, {
        id,
        dateKey,
        inMin: timeValue,
        outMin: null
      });
    } else {
      existing.inMin = Math.min(existing.inMin, timeValue);
      existing.outMin =
        existing.outMin == null
          ? timeValue
          : Math.max(existing.outMin, timeValue);
    }
  }

  return [...byTeacher.values()].map((record) => ({
    ...record,
    status: record.inMin > 585 ? "late" : "present",
    leaveType: null,
    holidayName: null
  }));
}

module.exports = {
  getTeachers,
  getTeacherById,
  findTeacherByLogin,
  addTeacher,
  updateTeacher,
  getAttendanceForTeacher,
  getTodayAttendance,
};
