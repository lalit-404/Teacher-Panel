const jwt = require("jsonwebtoken");
const store = require("../data/store");
const { jwtSecret, jwtExpiresIn, adminPassword } = require("../config");

const DEFAULT_PASSWORD = process.env.DEFAULT_TEACHER_PASSWORD || "123456";
const MIN_PASSWORD_LENGTH = 8;

function signToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function sanitizeTeacher(t) {
  if (!t) return null;
  const { password, ...safe } = t;
  return safe;
}

function publicTeacher(teacher) {
  return {
    ...sanitizeTeacher(teacher),
    // This flag is derived from the actual PASSWORD value. No extra
    // MustChange column is used in USERINFO.
    mustChangePassword: teacher.password === DEFAULT_PASSWORD,
  };
}

async function login(req, res, next) {
  try {
    const { identifier = "", password = "" } = req.body || {};
    const id = String(identifier).trim();

    if (id.toLowerCase() === "admin") {
      if (password !== adminPassword) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
      const token = signToken({ role: "admin", teacherId: null });
      return res.json({ token, role: "admin", user: null });
    }

    const teacher = await store.findTeacherByLogin(id);
    if (!teacher || teacher.password !== password) {
      return res.status(401).json({ error: "Invalid email/phone or password" });
    }

    const effectiveRole = teacher.isAdmin ? "admin" : "teacher";
    const token = signToken({ role: effectiveRole, teacherId: teacher.id });
    return res.json({ token, role: effectiveRole, user: publicTeacher(teacher) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    if (req.user.role === "admin" && !req.user.teacherId) {
      return res.json({ role: "admin", user: null });
    }
    const teacher = await store.getTeacherById(req.user.teacherId);
    return res.json({ role: req.user.role, user: publicTeacher(teacher) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { newPassword = "" } = req.body || {};
    if (!req.user.teacherId) {
      return res.status(400).json({ error: "Only teacher accounts have a password to change." });
    }

    const teacher = await store.getTeacherById(req.user.teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher account not found." });
    }

    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    if (newPassword === DEFAULT_PASSWORD) {
      return res.status(400).json({ error: "New password must be different from 123456." });
    }

    if (newPassword === teacher.password) {
      return res.status(400).json({ error: "New password must be different from your current password." });
    }

    const updated = await store.updateTeacher(req.user.teacherId, {
      password: newPassword,
    });

    return res.json({ user: publicTeacher(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, changePassword, sanitizeTeacher };
