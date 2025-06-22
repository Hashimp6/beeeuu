const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String }, 
  type: {
    type: String,
    enum: ['product', 'service'],
    required: true
  },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
