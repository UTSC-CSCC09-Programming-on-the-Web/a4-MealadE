function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

async function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    const { User } = require("../models");
    req.user = await User.findByPk(req.session.userId, {
      attributes: ["id", "username", "email"],
    });
  } else {
    req.user = null;
  }
  next();
}

module.exports = { requireAuth, attachUser };
