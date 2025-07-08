// controllers/galleryController.js

const cloudinary = require('../config/cloudinary');
const Gallery = require('../models/galleryModel');

// Create a new gallery post
const createGalleryPost = async (req, res) => {
  try {
    const { seller, caption } = req.body;
    console.log("hhh",seller, caption);
    

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Check if seller ID is provided
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    // Find existing gallery for the seller or create new one
    let gallery = await Gallery.findOne({ seller });

    if (gallery) {
      // Add new image to existing gallery
      gallery.images.push({
        image: req.file.path, // Cloudinary URL
        caption: caption || ''
      });
      await gallery.save();
    } else {
      // Create new gallery
      gallery = new Gallery({
        seller,
        images: [{
          image: req.file.path,
          caption: caption || ''
        }]
      });
      await gallery.save();
    }

    // Populate seller info if needed
    await gallery.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Gallery post created successfully',
      data: gallery
    });

  } catch (error) {
    console.error('Error creating gallery post:', error);
    
    // If there was an error and file was uploaded, delete it from cloudinary
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updateGalleryImage = async (req, res) => {
  try {
    const { seller } = req.params;
    const { caption } = req.body;
    const imageId = req.params.imageId;
console.log("rec",seller,caption,imageId);

    // Find gallery by seller
    const gallery = await Gallery.findOne({ seller });
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found for this seller',
      });
    }

    // Find the image by _id in the gallery.images array
    const imageItem = gallery.images.id(imageId);
    if (!imageItem) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in gallery',
      });
    }

    // Optional: Delete old image from Cloudinary if you're replacing the image
    if (req.file && imageItem.image.includes('cloudinary.com')) {
      const publicId = imageItem.image.split('/').pop().split('.')[0]; // Adjust if needed
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Error deleting old Cloudinary image:", err);
      }
    }

    // Update fields
    if (caption) imageItem.caption = caption;
    if (req.file) imageItem.image = req.file.path;

    await gallery.save();

    res.status(200).json({
      success: true,
      message: 'Gallery image updated successfully',
      data: gallery,
    });

  } catch (err) {
    console.error('Error updating gallery image:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image',
      error: err.message
    });
  }
};

// Get gallery by seller ID
const getGalleryBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log("glry",sellerId);
    const gallery = await Gallery.findOne({ seller: sellerId })
      .sort({ 'images.date': -1 }); // Sort images by date if you add date to images
console.log("glry",gallery);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found for this seller'
      });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });

  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a specific image from gallery
const deleteGalleryImage = async (req, res) => {
  try {
    const { sellerId, imageId } = req.params;

    const gallery = await Gallery.findOne({ seller: sellerId });

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Find the image to delete
    const imageIndex = gallery.images.findIndex(img => img._id.toString() === imageId);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in gallery'
      });
    }

    const imageToDelete = gallery.images[imageIndex];

    // Extract public_id from Cloudinary URL to delete from cloudinary
    const publicId = imageToDelete.image.split('/').pop().split('.')[0];
    
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(`store_gallery/${publicId}`);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Remove image from array
    gallery.images.splice(imageIndex, 1);
    await gallery.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: gallery
    });

  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete entire gallery for a seller
const deleteEntireGallery = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const gallery = await Gallery.findOne({ seller: sellerId });

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Delete all images from Cloudinary
    const deletePromises = gallery.images.map(async (image) => {
      const publicId = image.image.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`store_gallery/${publicId}`);
      } catch (error) {
        console.error(`Error deleting image ${publicId}:`, error);
      }
    });

    await Promise.all(deletePromises);

    // Delete gallery from database
    await Gallery.findByIdAndDelete(gallery._id);

    res.status(200).json({
      success: true,
      message: 'Gallery deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all galleries (admin function)
const getAllGalleries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const galleries = await Gallery.find()
      .populate('seller', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments();

    res.status(200).json({
      success: true,
      data: galleries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching all galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createGalleryPost,
  getGalleryBySeller,
  deleteGalleryImage,
  deleteEntireGallery,
  getAllGalleries,
  updateGalleryImage
};