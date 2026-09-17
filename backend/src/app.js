const express = require("express");
const cors = require("cors");
const { corsOrigin } = require("./config");

const authRoutes = require("./routes/auth.routes");
const teacherRoutes = require("./routes/teachers.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "teacherpanel-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

module.exports = app;
