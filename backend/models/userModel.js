const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String},
  role: {
    type: String,
    enum: ["user", "seller"],
    default: "user",
  },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  pushToken: {
    type: String,
    default: null
  },
place:{ type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
   
    coordinates: {
      type: [Number],
      default: [0, 0], 
    },
  },

  createdAt: { type: Date, default: Date.now },
});

// Add geospatial index
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);