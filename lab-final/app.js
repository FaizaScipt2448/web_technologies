const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");

const app = express();

// Routes
const crudRoutes = require("./routes/crud.routes");
const adminRoutes = require("./routes/admin.routes");
const orderRoutes = require("./routes/order.routes");
const cartRoutes = require("./routes/cart.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session Middleware (MUST be before cart/order routes)
app.use(
  session({
    secret: "cart_secret_key_change_this",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Make cart quantity available in all EJS views
app.use((req, res, next) => {
  const cart = req.session.cart || { items: {} };
  res.locals.cartQty = Object.values(cart.items || {}).reduce(
    (sum, qty) => sum + qty,
    0
  );
  next();
});

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

// ✅ Cart APIs
app.use("/cart", cartRoutes);

// ✅ Order/Checkout routes
app.use("/", orderRoutes);

// CRUD routes
app.use("/crud", crudRoutes);

// Admin panel routes
app.use("/admin", adminRoutes);

// optional redirect
app.get("/admin-panel", (req, res) => res.redirect("/admin"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
