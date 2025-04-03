const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Google OAuth Client

// Helper function to generate JWT
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * 📌 REGISTER - User Registration (Email/Password)
 */
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, fullname, gender, dob, phone, address, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            fullname,
            gender,
            dob,
            phone,
            address,
            role: role || "user", // Default role: user
        });

        await user.save();
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

/**
 * 📌 LOGIN - User Login (Email/Password)
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

/**
 * 📌 GOOGLE LOGIN - Authenticate with Google
 */
router.post("/google-login", async (req, res) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            // Create a new user if not found
            user = new User({ username: name, email, password: sub, role: "user" });
            await user.save();
        }

        // Generate JWT
        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Google authentication failed", error: error.message });
    }
});

module.exports = router;
