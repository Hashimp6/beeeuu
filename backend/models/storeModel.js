const mongoose = require("mongoose");
const storeSchema = new mongoose.Schema({ 
  storeName: { type: String, required: true }, 
  description: { type: String }, 
  profileImage: { type: String }, 
  place: { type: String },
  category: { type: String },
  location: {
    type: { type: String,enum: ['Point'], default: "Point" },
    coordinates: [Number] 
  },
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