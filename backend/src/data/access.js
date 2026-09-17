const path = require("path");
const odbc = require("odbc");

const dbPath = path.resolve(
  process.env.ACCESS_DB_PATH || path.join(__dirname, "att2000.mdb"),
);

const USERINFO_FIELDS = Object.freeze({
  id: "USERID",
  loginId: "Badgenumber",
  name: "Name",
  gender: "Gender",
  password: "PASSWORD",
});

const connectionString =
  process.env.ACCESS_CONNECTION_STRING ||
  `Driver={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=${dbPath};`;

let connectionPromise = null;

async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = odbc.connect(connectionString).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}

async function query(sql) {
  const connection = await getConnection();

  const cleanSql = String(sql ?? "").trim();

  if (!cleanSql) {
    throw new Error("Attempted to execute an empty SQL query.");
  }

  return connection.query(cleanSql);
}

async function closeConnection() {
  if (!connectionPromise) return;
  const connection = await connectionPromise.catch(() => null);
  connectionPromise = null;
  if (connection) await connection.close();
}

function escapeSql(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function sqlText(value) {
  return `'${escapeSql(value)}'`;
}

function sqlNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : String(fallback);
}

function sqlBoolean(value) {
  return value ? "True" : "False";
}

function bracket(name) {
  return `[${String(name).replace(/]/g, "]]")}]`;
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getField(row, aliases) {
  const entries = Object.entries(row || {});
  for (const alias of aliases) {
    const wanted = normalize(alias);
    const hit = entries.find(([key]) => normalize(key) === wanted);
    if (hit) return hit[1];
  }
  return null;
}

function findColumn(row, aliases) {
  if (!row) return null;
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const wanted = normalize(alias);
    const hit = keys.find((key) => normalize(key) === wanted);
    if (hit) return hit;
  }
  return null;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "y"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

function timeToMinutes(value) {
  if (value == null || value === "") return null;

  // node-odbc normally returns Access Date/Time fields as JavaScript Date
  // objects. Use the local clock components exactly as returned by ODBC.
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.getHours() * 60 + value.getMinutes();
  }

  const text = String(value).trim();
  if (!text) return null;

  // Common ODBC/Access date-time representations.
  // Examples:
  //   2026-09-16 08:31:22
  //   2026-09-16T08:31:22
  //   09/16/2026 08:31:22 AM
  //   16/09/2026 08:31:22
  const dateTime = text.match(
    /(?:^|\s)(?:\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4})[ T]+(\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:\s*[AP]M)?)/i,
  );
  const timeText = dateTime ? dateTime[1] : text;

  const match = timeText.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:\s*([AP]M))?$/i,
  );
  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || 0);
    const ampm = match[4]?.toUpperCase();

    if (minute > 59 || second > 59) return null;
    if (ampm) {
      if (hour < 1 || hour > 12) return null;
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
    } else if (hour > 23) {
      return null;
    }

    return hour * 60 + minute;
  }

  // Last-resort parsing for driver strings such as:
  // "Wed Sep 16 2026 08:31:22 GMT+0530 ..."
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getHours() * 60 + parsed.getMinutes();
  }

  return null;
}

function toDateKey(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(value.getDate()).padStart(2, "0")}`;
  }

  const text = String(value).trim();
  if (!text) return null;

  // Prefer the date text itself so we do not accidentally shift the
  // attendance day because of timezone conversion.
  const iso = text.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(
      iso[3],
    ).padStart(2, "0")}`;
  }

  const mdy = text.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (mdy) {
    return `${mdy[3]}-${String(mdy[1]).padStart(2, "0")}-${String(
      mdy[2],
    ).padStart(2, "0")}`;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function mapTeacher(row, index) {
  const rawId =
    getField(row, [
      "USERID",
      "User ID",
      "UserId",
      "Badgenumber",
      "BadgeNumber",
      "ID",
    ]) ?? `USER-${index + 1}`;

  const id = String(rawId).trim();
  const name = String(
    getField(row, ["Name", "User Name", "Full Name"]) ?? "",
  ).trim();

  const usernameValue = getField(row, [
    "Badgenumber",
    "BadgeNumber",
    "Username",
    "User Name",
    "USERID",
  ]);
  const username = String(usernameValue ?? id).trim();

  const passwordValue = getField(row, [
    "PASSWORD",
    "Password",
    "Login Password",
  ]);
  const password = String(
    passwordValue ?? process.env.DEFAULT_TEACHER_PASSWORD ?? "123456",
  );

  const phone = String(
    getField(row, ["OPHONE", "FPHONE", "Phone", "Phone Number", "Mobile"]) ??
      "",
  ).trim();

  const email = String(
    getField(row, ["EMAIL", "Email", "Email Address"]) ?? "",
  ).trim();

  const subject = String(
    getField(row, ["TITLE", "Subject", "Department", "DeptName", "DEPTNAME"]) ??
      "",
  ).trim();

  const gender = String(
    getField(row, ["Gender", "GENDER", "Sex"]) ?? "",
  ).trim();

  const joinDateValue = getField(row, [
    "HIREDDAY",
    "Hiredday",
    "JoinDate",
    "Join Date",
    "Joined On",
  ]);

  const joinDate = joinDateValue
    ? new Date(joinDateValue).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id,
    name,
    subject,
    gender,
    email,
    phone,
    username,
    password,
    joinDate,
    isAdmin: toBoolean(
      getField(row, ["IsAdmin", "Is Admin", "Admin", "Is Administrator"]),
    ),
  };
}

function mapAttendance(row) {
  const dateKey = toDateKey(getField(row, ["DateKey", "Date"]));
  const inMin = timeToMinutes(
    getField(row, ["FirstCheck", "CheckIn", "InTime"]),
  );
  const outMin = timeToMinutes(
    getField(row, ["LastCheck", "CheckOut", "OutTime"]),
  );

  let status;
  if (inMin == null && outMin == null) status = "absent";
  else status = inMin > 585 ? "late" : "present";

  return {
    dateKey,
    inMin,
    outMin,
    status,
    leaveType: null,
    holidayName: null,
  };
}
function accessDateLiteral(year, month, day = 1) {
  return `#${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}#`;
}
module.exports = {
  dbPath,
  getConnection,
  query,
  closeConnection,
  escapeSql,
  sqlText,
  sqlNumber,
  sqlBoolean,
  bracket,
  normalize,
  getField,
  findColumn,
  mapTeacher,
  mapAttendance,
  toDateKey,
  timeToMinutes,
  accessDateLiteral,
  USERINFO_FIELDS,
};
