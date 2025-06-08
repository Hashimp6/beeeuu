// config/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require('./cloudinary');

// Storage for Store Profile Images
const storeProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "store_profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  }
});
const uploadStoreImage = multer({ storage: storeProfileStorage });

// Storage for Product Images
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "product_images",  // different folder here
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  }
});
const uploadProductImage = multer({ storage: productImageStorage });
const galleryImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "store_gallery",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadGalleryImage = multer({ storage: galleryImageStorage });
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_images",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1024, height: 1024, crop: "limit", quality: "auto" }],
  },
});
const uploadChatImage = multer({ 
  storage: chatImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for chat images
  }
});
module.exports = { uploadStoreImage, uploadProductImage , uploadGalleryImage,uploadChatImage};
