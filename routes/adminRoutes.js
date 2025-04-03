const express = require("express");
const multer = require("multer");
const Entry = require("../models/Entry"); // Import Entry model
const { verifyToken, isAdmin } = require("../middleware/authMiddleware"); // Auth middleware

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`), // Unique filename
});

const upload = multer({ storage });

/**
 * 📌 CREATE - Admin Upload File & Add Entry
 * Only admins can upload files and create entries
 */
router.post("/upload", verifyToken, isAdmin, upload.single("file"), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const newEntry = new Entry({
            title,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
        });

        await newEntry.save();
        res.status(201).json({ success: true, message: "File uploaded successfully", entry: newEntry });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

/**
 * 📌 READ - Get All Entries (Admin Only)
 */
router.get("/entries", verifyToken, isAdmin, async (req, res) => {
    try {
        const entries = await Entry.find();
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

/**
 * 📌 READ - Get Single Entry by ID (Admin Only)
 */
router.get("/entries/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

/**
 * 📌 UPDATE - Admin Update Entry
 */
router.put("/entries/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEntry) return res.status(404).json({ success: false, message: "Entry not found" });

        res.json({ success: true, message: "Entry updated successfully", entry: updatedEntry });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

/**
 * 📌 DELETE - Admin Delete Entry
 */
router.delete("/entries/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
        if (!deletedEntry) return res.status(404).json({ success: false, message: "Entry not found" });

        res.json({ success: true, message: "Entry deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

module.exports = router;
