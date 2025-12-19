const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express(); // ✅ app must be created BEFORE using app.use

// ✅ Routes
const crudRoutes = require("./routes/crud.routes");
const adminRoutes = require("./routes/admin.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// DB connect
connectDB();

// Website pages
app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
app.get("/checkout", (req, res) => res.render("checkout"));

// ✅ CRUD routes (Assignment 3)
app.use("/crud", crudRoutes);

// ✅ Admin panel routes (Assignment 4)
app.use("/admin", adminRoutes);

// (optional) redirect /admin-panel -> /admin
app.get("/admin-panel", (req, res) => res.redirect("/admin"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
