const store = require("../data/store");
const { sanitizeTeacher } = require("./auth.controller");

async function list(req, res, next) {
  try {
    const teachers = await store.getTeachers();
    res.json({ teachers: teachers.map(sanitizeTeacher) });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const teacher = await store.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json({ teacher: sanitizeTeacher(teacher) });
  } catch (err) { next(err); }
}

async function addOne(req, res, next) {
  try {
    const { name, id, gender } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!id || !String(id).trim()) {
      return res.status(400).json({ error: "ID is required" });
    }
    if (!/^\d+$/.test(String(id).trim())) {
      return res.status(400).json({ error: "ID must contain only numbers." });
    }
    if (!gender || !String(gender).trim()) {
      return res.status(400).json({ error: "Gender is required" });
    }

    const record = await store.addTeacher({ name, id, gender });
    res.status(201).json({ teacher: sanitizeTeacher(record) });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, addOne };
