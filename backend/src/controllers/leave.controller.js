const store = require("../data/store");
const VALID_TYPES = ["Casual leave", "Sick leave", "Earned leave"];

async function list(req, res, next) {
  try { res.json({ requests: await store.getLeaveRequests() }); }
  catch (err) { next(err); }
}

async function mine(req, res, next) {
  try {
    if (!req.user.teacherId) return res.json({ requests: [] });
    res.json({ requests: await store.getLeaveRequestsByTeacher(req.user.teacherId) });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    if (!req.user.teacherId) return res.status(400).json({ error: "Only teacher accounts can submit leave requests." });
    const { type, dates, reason } = req.body || {};
    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }
    if (!dates || !dates.trim()) return res.status(400).json({ error: "dates is required." });
    if (!reason || !reason.trim()) return res.status(400).json({ error: "reason is required." });

    const teacher = await store.getTeacherById(req.user.teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const record = await store.addLeaveRequest({
      teacherId: teacher.id, name: teacher.name, type,
      dates: dates.trim(), reason: reason.trim(), status: "pending"
    });
    res.status(201).json({ request: record });
  } catch (err) { next(err); }
}

async function respond(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!["approved", "declined", "pending"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved', 'declined' or 'pending'" });
    }
    const updated = await store.updateLeaveRequest(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Leave request not found" });
    res.json({ request: updated });
  } catch (err) { next(err); }
}

module.exports = { list, mine, create, respond, VALID_TYPES };
