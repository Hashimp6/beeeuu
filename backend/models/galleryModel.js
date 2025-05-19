const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gallery", gallerySchema);
