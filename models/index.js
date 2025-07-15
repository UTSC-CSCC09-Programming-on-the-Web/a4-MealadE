const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../database.sqlite"),
  logging: false,
});

const User = require("./user")(sequelize);
const Image = require("./image")(sequelize);
const Comment = require("./comment")(sequelize);

User.hasMany(Image, { onDelete: "CASCADE" });
Image.belongsTo(User);

User.hasMany(Comment, { onDelete: "CASCADE" });
Comment.belongsTo(User);

Image.hasMany(Comment, { onDelete: "CASCADE" });
Comment.belongsTo(Image);

sequelize
  .sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

module.exports = {
  sequelize,
  User,
  Image,
  Comment,
};
