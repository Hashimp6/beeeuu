const mongoose = require("mongoose");
const storeSchema = new mongoose.Schema({ 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeName: { type: String, required: true }, 
  description: { type: String }, 
  profileImage: { type: String }, 
  place: { type: String },
  category: { type: String },
  location: {
    type: { type: String,enum: ['Point'], default: "Point" },
    coordinates: [Number] 
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numberOfRatings: {
    type: Number,
    default: 0
  }
,  
upi:{ type: String },
  phone: { type: String },
  socialMedia: { 
    whatsapp: { type: String }, 
    instagram: { type: String }, 
    facebook: { type: String }, 
    website: { type: String }, 
  }, 
  createdAt: { type: Date, default: Date.now }, 
});

// Add geospatial index on the location field
storeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Store", storeSchema);