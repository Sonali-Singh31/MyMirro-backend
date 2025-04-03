const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowedFormats: ["jpg", "png", "jpeg"]
    }
});

const upload = multer({ storage });

// 📌 Upload Image Route
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
    }
    res.json({ success: true, imageUrl: req.file.path });
});

module.exports = router;
