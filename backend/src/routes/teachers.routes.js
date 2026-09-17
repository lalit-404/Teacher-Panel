const express = require("express");
const ctrl = require("../controllers/teachers.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, ctrl.list);
router.get("/:id", requireAuth, ctrl.getOne);
router.post("/", requireAuth, requireAdmin, ctrl.addOne);

module.exports = router;
