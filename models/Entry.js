const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Entry", EntrySchema);
