const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// ✅ Helper: get or init cart (SAFE)
function getCart(req) {
  if (!req.session) {
    // safety fallback (should not happen if session middleware is correct)
    req.session = {};
  }

  if (!req.session.cart) {
    req.session.cart = { items: {} };
  }

  return req.session.cart;
}

// ✅ Helper: convert session cart to view model (items + totals)
async function cartToViewModel(cart) {
  const ids = Object.keys(cart.items || {});
  if (ids.length === 0) {
    return { items: [], totalQty: 0, totalPrice: 0 };
  }

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

/**
 * ✅ STEP 4 requirement:
 * /cart ko page na banao, checkout pe redirect
 */
router.get("/", (req, res) => {
  return res.redirect("/checkout");
});

// ✅ Get cart details (debug / frontend use)
router.get("/api", async (req, res) => {
  try {
    const cart = getCart(req);
    const cartVM = await cartToViewModel(cart);
    return res.json({ isSuccess: true, data: cartVM });
  } catch (err) {
    console.error("GET /cart/api error:", err);
    return res.status(500).json({ isSuccess: false, message: "Failed to get cart" });
  }
});

// ✅ Add item to cart
router.post("/api/add", (req, res) => {
  try {
    const { productId, qty } = req.body;

    if (!productId) {
      return res.status(400).json({
        isSuccess: false,
        message: "productId required",
      });
    }

    const cart = getCart(req);
    const addQty = Math.max(1, Number(qty || 1));

    cart.items[productId] = (cart.items[productId] || 0) + addQty;
    req.session.cart = cart;

    return res.json({ isSuccess: true });
  } catch (err) {
    console.error("POST /cart/api/add error:", err);
    return res.status(500).json({
      isSuccess: false,
      message: "Add to cart failed",
    });
  }
});

// ✅ Update qty
router.post("/api/update", (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (!productId) {
      return res.status(400).json({ isSuccess: false, message: "productId required" });
    }

    const cart = getCart(req);
    const newQty = Number(qty);

    if (!newQty || newQty <= 0) {
      delete cart.items[productId];
    } else {
      cart.items[productId] = newQty;
    }

    req.session.cart = cart;
    return res.json({ isSuccess: true });
  } catch (err) {
    console.error("POST /cart/api/update error:", err);
    return res.status(500).json({ isSuccess: false, message: "Update failed" });
  }
});

// ✅ Remove item
router.post("/api/remove", (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ isSuccess: false, message: "productId required" });
    }

    const cart = getCart(req);
    delete cart.items[productId];
    req.session.cart = cart;

    return res.json({ isSuccess: true });
  } catch (err) {
    console.error("POST /cart/api/remove error:", err);
    return res.status(500).json({ isSuccess: false, message: "Remove failed" });
  }
});

// ✅ Clear cart
router.post("/api/clear", (req, res) => {
  try {
    if (req.session) {
      req.session.cart = { items: {} };
    }
    return res.json({ isSuccess: true });
  } catch (err) {
    console.error("POST /cart/api/clear error:", err);
    return res.status(500).json({ isSuccess: false, message: "Clear cart failed" });
  }
});

module.exports = router;
