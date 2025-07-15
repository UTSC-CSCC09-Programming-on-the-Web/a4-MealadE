const express = require("express");
const router = express.Router();
const { Image, Comment, User } = require("../models");
const {
  requireAuth,
  requireImageOwnerOrCommentOwner,
} = require("./authorization");

router.get("/:imageId/comments", requireAuth, async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: { ImageId: req.params.imageId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
        {
          model: Image,
          attributes: ["id", "UserId"],
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:imageId/comments", requireAuth, async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    if (!req.body.content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await Comment.create({
      content: req.body.content,
      UserId: req.session.userId,
      ImageId: req.params.imageId,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete(
  "/:imageId/comments/:commentId",
  requireAuth,
  requireImageOwnerOrCommentOwner,
  async (req, res) => {
    try {
      const comment = req.comment;
      await comment.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
