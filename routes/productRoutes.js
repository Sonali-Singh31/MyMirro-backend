const express = require("express");
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 CREATE - Add a new product (Admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, brand, category, price, images, description, stock, sizes, colors, material, gender } = req.body;

        if (!name || !brand || !category || !price || !images || images.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newProduct = new Product({
            name, brand, category, price, images, description, stock, sizes, colors, material, gender,
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 📌 READ - Get all products (Public)
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 📌 READ - Get a product by ID (Public)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 📌 UPDATE - Update product (Admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 📌 DELETE - Delete a product (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

module.exports = router;
