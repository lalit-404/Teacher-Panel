const express = require("express");
const ctrl = require("../controllers/attendance.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/teacher/:id", requireAuth, ctrl.teacherMonth);
router.get("/today", requireAuth, requireAdmin, ctrl.today);
router.get("/summary", requireAuth, requireAdmin, ctrl.monthlySummary);

module.exports = router;
