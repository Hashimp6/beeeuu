// controllers/galleryController.js
const Gallery = require("../models/galleryModel");

// Add gallery image
const addGalleryImage = async (req, res) => {
  try {
    const { store, caption } = req.body;

    if (!store || !req.file || !req.file.path) {
      return res.status(400).json({ message: "Store and image are required" });
    }

    const newImage = new Gallery({
      store,
      imageUrl: req.file.path,
      caption,
    });

    const savedImage = await newImage.save();

    res.status(201).json({ message: "Image added to gallery", image: savedImage });
  } catch (error) {
    res.status(500).json({ message: "Failed to add image", error: error.message });
  }
};

// Delete gallery image
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Optional: Remove from Cloudinary (if you store public_id)
    // You must store public_id in MongoDB to delete Cloudinary image:
    // await cloudinary.uploader.destroy(image.cloudinaryId);

    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Image removed from gallery" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};

module.exports = {
  addGalleryImage,
  deleteGalleryImage,
};
