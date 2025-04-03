const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google sign-up users
    googleId: { type: String }, // Store Google UID for OAuth
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: Date, required: true },
    phone: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true }
    },
    role: { type: String, enum: ["admin", "user"], default: "user" }
});

// Ensure unique email constraint (index)
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
