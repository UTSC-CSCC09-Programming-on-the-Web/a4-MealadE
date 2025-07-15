const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { requireAuth, attachUser } = require("./auth-middleware");
const {
  requireImageOwner,
  requireCommentOwner,
  requireImageOwnerOrCommentOwner,
} = require("./authorization");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: "Username already taken." });
    }
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    req.session.userId = user.id;
    res.status(201).json({
      message: "Signup successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    req.session.userId = user.id;
    res.json({
      message: "Signin successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.post("/signout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Signout successful" });
  });
});

router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await User.findByPk(req.session.userId, {
    attributes: ["id", "username", "email"],
  });
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user });
});

module.exports = router;
