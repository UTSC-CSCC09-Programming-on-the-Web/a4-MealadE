const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const imagesRouter = require("./routers/images");
const commentsRouter = require("./routers/comments");
const authRouter = require("./routers/auth");
const { Image, User } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

console.log("Initializing Express application");

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "static")));

console.log("Setting up API routes");

app.use("/api/auth", authRouter);
app.use("/api/images", imagesRouter);
app.use("/api/images", commentsRouter);

app.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [["username", "ASC"]],
      include: [
        {
          model: Image,
          attributes: ["id"],
          separate: true,
          limit: 1,
        },
      ],
    });

    const usersWithCounts = await Promise.all(
      rows.map(async (user) => {
        const imageCount = await Image.count({ where: { UserId: user.id } });
        return {
          id: user.id,
          username: user.username,
          imageCount: imageCount,
          hasImages: imageCount > 0,
        };
      }),
    );

    res.json({
      data: usersWithCounts,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error in GET /users:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.get("/api/users/:userId/gallery", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.params.userId;
    const { count, rows } = await Image.findAndCountAll({
      where: { UserId: userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
