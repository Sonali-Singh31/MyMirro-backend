require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ CORS Configuration - Restrict origins (Allow only frontend URL in production)
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ["*"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // Added Upload Route

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes); // ✅ Upload Route for Cloudinary

// ✅ MongoDB Connection
const startServer = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not defined in environment variables!");
        }

        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB Connected Successfully");

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

        // Graceful Shutdown - Handles SIGINT (Ctrl + C) & SIGTERM (Deployment stops)
        const gracefulShutdown = async () => {
            console.log("🛑 Closing server...");
            await mongoose.connection.close();
            server.close(() => {
                console.log("💾 MongoDB disconnected & Server shut down.");
                process.exit(0);
            });
        };

        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);

    } catch (err) {
        console.error("❌ Error starting server:", err.message);
        process.exit(1);
    }
};

// ✅ Start the server
startServer();

// ✅ Global Error Handler - Catches any unhandled errors
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
