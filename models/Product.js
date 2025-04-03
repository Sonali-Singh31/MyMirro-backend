const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, enum: ["Shoes", "Clothing", "Accessories"], required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }], // Array of image URLs
    description: { type: String, required: true },
    stock: { type: Number, default: 0 },
    sizes: [{ type: String }], // Array of available sizes (like "S", "M", "L")
    colors: [{ type: String }], // Array of available colors
    material: { type: String }, // Example: "Cotton", "Leather"
    gender: { type: String, enum: ["Men", "Women", "Unisex"] }, // Target audience
    ratings: { type: Number, default: 0 }, // Average user rating
    reviews: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        comment: String, 
        rating: Number 
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
