const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String},
  otherAccounts: [
    {
      storeName: String,
      email: String,
      password: String  // you’d store the password here
    }
  ],
  role: {
    type: String,
    enum: ["user", "seller","admin"],
    default: "user",
  },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  pushTokens: {
    type: [String],
    default: [],
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