const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String }, // Keep existing description field
  images: [{ type: String }], // Array of image paths
  type: {
    type: String,
    enum: ['product', 'service'],
    required: true
  },
  active: {
    type: Boolean,
    default: true, // means product is active by default
  },
  price: { type: Number, required: true },
  quantity: { type: Number},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);