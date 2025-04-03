const jwt = require("jsonwebtoken");

/**
 * 📌 Middleware: Verify Token (JWT Authentication)
 */
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

/**
 * 📌 Middleware: Check Admin Role
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access Denied. Admins only." });
    }
    next();
};

/**
 * 📌 Middleware: Check User Role
 */
const isUser = (req, res, next) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({ success: false, message: "Access Denied. Users only." });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isUser };
