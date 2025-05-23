const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true, // For fast lookups by seller
  },
  date: {
    type: Date,
    default: Date.now, // When the gallery was created
  },
  images: [
    {
      image: {
        type: String, // URL from Cloudinary or S3
        required: true,
      },
      caption: {
        type: String,
        default: '',
      },
    }
  ]
});


module.exports = mongoose.model("Gallery", gallerySchema);
