// routes/galleryRoutes.js
const express = require("express");
const router = express.Router();
const { uploadGalleryImage } = require("../config/multer");
const { addGalleryImage, deleteGalleryImage } = require("../controllers/galleryController");

// POST: Add gallery image
router.post("/add", uploadGalleryImage.single("image"), addGalleryImage);

// DELETE: Remove gallery image
router.delete("/:id", deleteGalleryImage);

module.exports = router;
