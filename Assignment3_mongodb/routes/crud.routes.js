const express = require("express");
const router = express.Router();
const axios = require("axios");
const Product = require("../models/product");

// ✅ Render CRUD page
router.get("/", (req, res) => {
  res.render("crud");
});

/**
 * ✅ SEED FakeStore products into MongoDB
 * Browser:
 *  - http://localhost:3000/crud/api/seed-fakestore?clear=true
 *  - http://localhost:3000/crud/api/seed-fakestore
 */
router.get("/api/seed-fakestore", async (req, res) => {
  try {
    const clear = String(req.query.clear || "").toLowerCase() === "true";

    const { data } = await axios.get("https://fakestoreapi.com/products");

    const formatted = data.map((p) => ({
      title: p.title,
      price: Number(p.price),
      category: p.category,
      image: p.image, // ✅ real image
      description: p.description,
    }));

    if (clear) await Product.deleteMany({});
    const inserted = await Product.insertMany(formatted);

    res.json({
      message: "✅ FakeStore products seeded",
      count: inserted.length,
      clearedOld: clear,
    });
  } catch (err) {
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

/**
 * ✅ GET products with Pagination + Filters
 * Examples:
 *  /crud/api/products?page=1&limit=10
 *  /crud/api/products?page=2&limit=6&category=electronics
 *  /crud/api/products?minPrice=50&maxPrice=200
 */
router.get("/api/products", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);

    const category = (req.query.category || "").trim();
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;

    const filter = {};

    if (category) filter.category = category;

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null && !Number.isNaN(minPrice)) filter.price.$gte = minPrice;
      if (maxPrice !== null && !Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;

      // If invalid values were provided, remove empty price filter
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    const total = await Product.countDocuments(filter);

    const items = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// ✅ CREATE product
router.post("/api/products", async (req, res) => {
  try {
    const { title, price, category, image, description } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const product = await Product.create({
      title,
      price: Number(price),
      category,
      image,
      description,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Create failed", error: err.message });
  }
});

// ✅ UPDATE product
router.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// ✅ DELETE product
router.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
