const fs = require("fs");
const path = require("path");
const { query } = require("./access");

const DEFAULT_PASSWORD = process.env.DEFAULT_TEACHER_PASSWORD || "123456";
const MARKER_FILE = path.resolve(__dirname, "../../.teacher-passwords-initialized");

async function initializeTeacherPasswords() {
  if (fs.existsSync(MARKER_FILE)) {
    return;
  }

  // PASSWORD already exists in USERINFO. Do not alter the table schema.
  // This is a one-time initialization so existing teachers receive the
  // requested default password without resetting passwords on every restart.
  await query(
    `UPDATE [USERINFO] SET [PASSWORD] = '${String(DEFAULT_PASSWORD).replace(/'/g, "''")}'`
  );

  fs.writeFileSync(
    MARKER_FILE,
    `Teacher passwords initialized to the default password on ${new Date().toISOString()}\n`,
    "utf8"
  );

  console.log(`USERINFO: all teacher passwords initialized to ${DEFAULT_PASSWORD}`);
}

module.exports = { initializeTeacherPasswords };
