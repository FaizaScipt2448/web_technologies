const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// ✅ Admin Dashboard
router.get("/", async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

  res.render("admin/dashboard", {
    totalProducts,
    latestProducts,
  });
});

// ✅ Admin Product List (READ)
router.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render("admin/products", { products });
});

// ✅ Add Product page
router.get("/products/new", (req, res) => {
  res.render("admin/product-form", { product: null });
});

// ✅ Create product (CREATE)
router.post("/products", async (req, res) => {
  const { title, price, category, image, description } = req.body;

  if (!title || !category || price === undefined) {
    return res.redirect("/admin/products/new");
  }

  await Product.create({
    title: title.trim(),
    price: Number(price),
    category: category.trim(),
    image:
      (image && image.trim()) ||
      `https://picsum.photos/seed/${Date.now()}/400/400`,
    description: description || "",
  });

  res.redirect("/admin/products");
});

// ✅ Edit product page
router.get("/products/:id/edit", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  res.render("admin/product-form", { product });
});

// ✅ Update product (UPDATE)
router.post("/products/:id", async (req, res) => {
  const { title, price, category, image, description } = req.body;

  await Product.findByIdAndUpdate(req.params.id, {
    title: title.trim(),
    price: Number(price),
    category: category.trim(),
    image:
      (image && image.trim()) ||
      `https://picsum.photos/seed/${Date.now()}/400/400`,
    description: description || "",
  });

  res.redirect("/admin/products");
});

// ✅ Delete product (DELETE)
router.post("/products/:id/delete", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin/products");
});

module.exports = router;
