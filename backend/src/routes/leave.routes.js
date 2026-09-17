const express = require("express");
const ctrl = require("../controllers/leave.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Teacher-facing: submit a request, view only their own requests.
router.post("/", requireAuth, ctrl.create);
router.get("/mine", requireAuth, ctrl.mine);

// Admin-facing: view every request, approve/decline.
router.get("/", requireAuth, requireAdmin, ctrl.list);
router.patch("/:id", requireAuth, requireAdmin, ctrl.respond);

module.exports = router;
