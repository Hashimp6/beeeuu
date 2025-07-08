// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const { uploadGalleryImage } = require('../config/multer');
const {
  createGalleryPost,
  getGalleryBySeller,
  deleteGalleryImage,
  deleteEntireGallery,
  getAllGalleries,
  updateGalleryImage
} = require('../controllers/galleryController');

// Middleware for authentication (add your auth middleware here)
// const { authenticateSeller, authenticateAdmin } = require('../middleware/auth');

router.post('/', uploadGalleryImage.single('image'), createGalleryPost);

// PUT /gallery/:seller/image/:imageId
router.put('/:seller/image/:imageId', uploadGalleryImage.single('image'), updateGalleryImage);

router.get('/:sellerId', getGalleryBySeller);

router.delete('/:sellerId/image/:imageId', deleteGalleryImage);

router.delete('/:sellerId', deleteEntireGallery);

router.get('/all', getAllGalleries);

module.exports = router;