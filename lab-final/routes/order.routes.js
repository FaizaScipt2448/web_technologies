const express = require("express");
const router = express.Router();

const Product = require("../models/product");
const Order = require("../models/order");

// ✅ Safe cart getter
function getCart(req) {
  if (!req.session) return { items: {} };              // safety
  if (!req.session.cart) req.session.cart = { items: {} };
  return req.session.cart;
}

// ✅ Convert session cart -> view model for checkout page
async function cartToViewModel(cart) {
  const ids = Object.keys(cart.items || {});
  if (ids.length === 0) return { items: [], totalQty: 0, totalPrice: 0 };

  const products = await Product.find({ _id: { $in: ids } }).lean();

  let totalQty = 0;
  let totalPrice = 0;

  const items = products.map((p) => {
    const id = String(p._id);
    const qty = Number(cart.items[id] || 0);
    const price = Number(p.price || 0);
    const lineTotal = qty * price;

    totalQty += qty;
    totalPrice += lineTotal;

    return {
      id,
      title: p.title,
      image: p.image,
      price,
      qty,
      lineTotal,
    };
  });

  return { items, totalQty, totalPrice };
}

// ✅ GET /checkout
router.get("/checkout", async (req, res) => {
  const cart = getCart(req);
  const cartVM = await cartToViewModel(cart);
  res.render("checkout", { cart: cartVM });
});

// ✅ POST /checkout (Create order)
router.post("/checkout", async (req, res) => {
  const { customerName, email } = req.body;

  if (!customerName || !email) {
    return res.status(400).send("Customer name and email are required.");
  }

  const cart = getCart(req);
  const ids = Object.keys(cart.items || {});
  if (ids.length === 0) return res.redirect("/checkout");

  const products = await Product.find({ _id: { $in: ids } }).lean();

  const orderItems = [];
  let totalAmount = 0;

  for (const p of products) {
    const id = String(p._id);
    const qty = Number(cart.items[id] || 0);
    if (qty <= 0) continue;

    const price = Number(p.price || 0);
    orderItems.push({
      product: p._id,
      quantity: qty,
      price,
    });

    totalAmount += qty * price;
  }

  if (orderItems.length === 0) return res.redirect("/checkout");

  const order = await Order.create({
    customerName,
    email,
    items: orderItems,
    totalAmount,
    status: "Pending",
  });

  // ✅ Clear cart safely
  if (req.session) req.session.cart = { items: {} };

  return res.redirect(`/order-confirmation/${order._id}`);
});

// ✅ Confirmation page
router.get("/order-confirmation/:id", (req, res) => {
  res.render("order-confirmation", { orderId: req.params.id });
});

module.exports = router;
