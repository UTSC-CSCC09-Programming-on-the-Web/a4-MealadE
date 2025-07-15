const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Image, User } = require("../models");
const { requireAuth, requireImageOwner } = require("./authorization");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.userId) {
      where.UserId = req.query.userId;
    }
    const { count, rows } = await Image.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });
    res.json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const image = await Image.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: req.body.title,
      UserId: req.session.userId,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.delete("/:id", requireAuth, requireImageOwner, async (req, res) => {
  try {
    const image = req.image;
    const filePath = path.join(__dirname, "../uploads", image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await image.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
