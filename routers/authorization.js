const { Image, Comment } = require("../models");

// Ensures user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Ensures user owns the image
async function requireImageOwner(req, res, next) {
  const imageId = req.params.id || req.params.imageId;
  const image = await Image.findByPk(imageId);
  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }
  if (image.UserId !== req.session.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized: not the image owner" });
  }
  req.image = image;
  next();
}

// Ensures user owns the comment
async function requireCommentOwner(req, res, next) {
  const commentId = req.params.commentId;
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }
  if (comment.UserId !== req.session.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized: not the comment owner" });
  }
  req.comment = comment;
  next();
}

// Ensures user is either the image owner or the comment owner
async function requireImageOwnerOrCommentOwner(req, res, next) {
  const imageId = req.params.imageId;
  const commentId = req.params.commentId;
  const image = await Image.findByPk(imageId);
  const comment = await Comment.findByPk(commentId);
  if (!image || !comment) {
    return res.status(404).json({ error: "Image or comment not found" });
  }
  if (
    image.UserId === req.session.userId ||
    comment.UserId === req.session.userId
  ) {
    req.image = image;
    req.comment = comment;
    return next();
  }
  return res.status(403).json({ error: "Not authorized: not the owner" });
}

module.exports = {
  requireAuth,
  requireImageOwner,
  requireCommentOwner,
  requireImageOwnerOrCommentOwner,
};
