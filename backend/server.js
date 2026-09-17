require("dotenv").config();
const app = require("./src/app");
const { port, host } = require("./src/config");
const { getConnection, dbPath } = require("./src/data/access");
const { initializeTeacherPasswords } = require("./src/data/migrate");

(async () => {
  try {
    await getConnection();
    console.log(`Microsoft Access connected: ${dbPath}`);
    await initializeTeacherPasswords();
    app.listen(port, host, () => {
      console.log(`Teacher Panel API listening on ${host === "0.0.0.0" ? `port ${port}` : `http://${host}:${port}`}`);
    });
  } catch (err) {
    console.error("Could not connect to Microsoft Access.");
    console.error(err.message);
    console.error(
      "Check ACCESS_DB_PATH and that the Microsoft Access ODBC driver is installed.",
    );
    process.exit(1);
  }
})();
