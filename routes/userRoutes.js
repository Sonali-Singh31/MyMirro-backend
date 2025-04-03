const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Import User model
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 CREATE - Register a new user
router.post("/", async (req, res) => {
    try {
        const { username, fullname, email, password, googleId, gender, dob, phone, address } = req.body;

        // Ensure all required fields are present
        if (!email || (!password && !googleId) || !fullname) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already registered" });

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword,
            googleId,
            gender,
            dob,
            phone,
            address,
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 📌 READ - Get all users (Admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 📌 READ - Get user by ID (Only user or admin can access)
router.get("/:id", verifyToken, async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 📌 UPDATE - Update user details (Only user or admin)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 📌 DELETE - Remove a user (Only admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

module.exports = router;
