const Offer = require("../models/OffersModel");
const Store = require("../models/storeModel");
const UserSeenOffer = require("../models/UserSeenOfferModel");

// Create Offer
const createOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, validFrom, validTo, category, tags , originalPrice, offerPrice,storeId } = req.body;
    
    if(!storeId)
    {
        return res.status(404).json({ 
            success: false, 
            message: "StoreId not found" 
          });
    }
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: "Store not found" 
      });
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validTo)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid from date must be before valid to date" 
      });
    }

    if (new Date(validTo) <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid to date must be in the future" 
      });
    }

    const offer = new Offer({
      storeId: store._id,
      title,
      description,
      discountType,
      discountValue,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      place: store.place,
      image: req.file?.path || "",
      isPremium: store.isPremium || false,
      originalPrice,
      offerPrice,
      isActive: true, // Default to active
      location: {
        type: "Point",
        coordinates: store.location.coordinates
      }
    });

    await offer.save();
    await offer.populate('storeId', 'storeName storeImage');

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer
    });

  } catch (error) {
    console.error("Create offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create offer"
    });
  }
};

// Get Nearby Offers (Updated for better category handling)
const getNearbyOffers = async (req, res) => {
    try {
      const { lat, lng, category, storeName, radius = 1000, lastOfferId, nextZone = false } = req.query;
      const userId = req.user._id;
  
      if (!lat || !lng) {
        return res.status(400).json({ success: false, message: "Latitude and longitude required" });
      }
  
      const seenOfferRecord = await UserSeenOffer.findOne({ userId });
      const seenOfferIds = seenOfferRecord ? seenOfferRecord.seenOffers : [];
  
      // Build base query
      let query = {
        isActive: true,
        validTo: { $gte: new Date() },
        _id: { $nin: seenOfferIds } // Exclude ALL seen offers for "see once" behavior
      };
  
      // Add category filter if provided (if not provided, it will fetch all categories)
      if (category && category.trim() !== '') {
        query.category = category;
      }
  
      // Add store filter if provided
      if (storeName) {
        const storeMatches = await Store.find({ storeName: new RegExp(storeName, "i") }).select("_id");
        query.storeId = { $in: storeMatches.map(s => s._id) };
      }
  
      let offers;
  
      if (nextZone === 'true') {
        // NEXT ZONE: No location restriction, just sort by distance
        const pipeline = [
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
              distanceField: "distance",
              spherical: true,
              query: query // Move the query filter here
            }
          },
          { $sort: { isPremium: -1, distance: 1 } }, // Premium first, then closest
          { $limit: 1 }
        ];

        offers = await Offer.aggregate(pipeline);

        // Populate after aggregation
        if (offers.length > 0) {
          await Offer.populate(offers, { path: 'storeId', select: 'storeName storeImage rating' });
        }
      } else {
        // NEARBY: Within radius
        query.location = {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        };
  
        offers = await Offer.find(query)
          .populate("storeId", "storeName profileImage averageRating place phone")
          .sort({ isPremium: -1, createdAt: -1 })
          .limit(1);
      }
  
      const nextOffer = offers[0];
  
      if (!nextOffer) {
        return res.json({
          success: true,
          data: null,
          message: nextZone === 'true' ? "No more unseen offers available" : "No more offers in this radius",
          suggestion: nextZone === 'true' ? "All offers have been viewed" : "Try enabling next zone or increasing radius"
        });
      }
  
      res.json({
        success: true,
        data: nextOffer,
        isNextZone: nextZone === 'true'
      });
  
    } catch (error) {
      console.error("Get nearby offers error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch offer" });
    }
};

// Mark Offer as Seen
const markOfferSeen = async (req, res) => {
    try {
      const { offerId } = req.body;
      const userId = req.user._id;
  
      if (!offerId) {
        return res.status(400).json({
          success: false,
          message: "Offer ID is required"
        });
      }
  
      // Check if offer exists and is valid
      const offer = await Offer.findOne({
        _id: offerId,
        isActive: true,
        validTo: { $gte: new Date() }
      });
  
      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found or expired"
        });
      }
  
      // Add to seen offers (this ensures "see once" behavior)
      const result = await UserSeenOffer.findOneAndUpdate(
        { userId },
        { 
          $addToSet: { seenOffers: offerId },
          $set: { lastSeenAt: new Date() }
        },
        { upsert: true, new: true }
      );
  
      res.json({
        success: true,
        message: "Offer marked as seen",
        totalSeenOffers: result.seenOffers.length
      });
  
    } catch (error) {
      console.error("Mark offer seen error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark offer as seen"
      });
    }
};

// Get Offer Details
const getOfferDetails = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId)
    .populate("storeId", "storeName profileImage averageRating place phone")

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    res.json({
      success: true,
      data: offer
    });

  } catch (error) {
    console.error("Get offer details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offer details"
    });
  }
};

// Get Store Offers (for store profile page) - Enhanced with pagination and filters
const getStoreOffers = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 10, includeInactive = false, category } = req.query;

    // Build query
    let query = {
      storeId,
      validTo: { $gte: new Date() }
    };

    // Include inactive offers if requested (for store owner)
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const offers = await Offer.find(query)
    .populate("storeId", "storeName profileImage averageRating place phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOffers = await Offer.countDocuments(query);

    res.json({
      success: true,
      data: offers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOffers / parseInt(limit)),
        totalOffers,
        hasMore: parseInt(page) * parseInt(limit) < totalOffers
      }
    });

  } catch (error) {
    console.error("Get store offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store offers"
    });
  }
};

// Get Offers by Shop ID (Alternative method with different response structure)
const getOffersByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status = 'active' } = req.query; // active, inactive, all

    // Verify shop exists
    const shop = await Store.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    let query = { storeId: shopId };

    // Filter by status
    switch (status) {
      case 'active':
        query.isActive = true;
        query.validTo = { $gte: new Date() };
        break;
      case 'inactive':
        query.$or = [
          { isActive: false },
          { validTo: { $lt: new Date() } }
        ];
        break;
      case 'all':
        // No additional filters
        break;
      default:
        query.isActive = true;
        query.validTo = { $gte: new Date() };
    }

    const offers = await Offer.find(query)
    .populate("storeId", "storeName profileImage averageRating place phone")
      .sort({ isPremium: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        shop: {
          _id: shop._id,
          storeName: shop.storeName,
          storeImage: shop.storeImage,
          rating: shop.rating
        },
        offers,
        totalOffers: offers.length
      }
    });

  } catch (error) {
    console.error("Get offers by shop ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop offers"
    });
  }
};

// Edit/Update Offer
const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updateData = req.body;

    // Find existing offer
    const existingOffer = await Offer.findById(offerId);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    // Validate dates if provided
    if (updateData.validFrom && updateData.validTo) {
      if (new Date(updateData.validFrom) >= new Date(updateData.validTo)) {
        return res.status(400).json({
          success: false,
          message: "Valid from date must be before valid to date"
        });
      }
    }

    // If only validTo is updated, check it's after validFrom
    if (updateData.validTo && !updateData.validFrom) {
      if (new Date(updateData.validTo) <= existingOffer.validFrom) {
        return res.status(400).json({
          success: false,
          message: "Valid to date must be after current valid from date"
        });
      }
    }

    // If only validFrom is updated, check it's before validTo
    if (updateData.validFrom && !updateData.validTo) {
      if (new Date(updateData.validFrom) >= existingOffer.validTo) {
        return res.status(400).json({
          success: false,
          message: "Valid from date must be before current valid to date"
        });
      }
    }

    // Process tags if provided
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    // Handle image update
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Convert date strings to Date objects
    if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
    if (updateData.validTo) updateData.validTo = new Date(updateData.validTo);

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      updateData,
      { new: true, runValidators: true }
    ).populate("storeId", "storeName profileImage averageRating place phone")

    res.json({
      success: true,
      message: "Offer updated successfully",
      data: updatedOffer
    });

  } catch (error) {
    console.error("Update offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offer"
    });
  }
};

// Delete Offer (Soft delete by setting isActive to false)
const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { permanent = false } = req.query;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    if (permanent === 'true') {
      // Permanent deletion
      await Offer.findByIdAndDelete(offerId);
      
      // Also remove from user seen offers
      await UserSeenOffer.updateMany(
        { seenOffers: offerId },
        { $pull: { seenOffers: offerId } }
      );

      res.json({
        success: true,
        message: "Offer permanently deleted"
      });
    } else {
      // Soft deletion
      const updatedOffer = await Offer.findByIdAndUpdate(
        offerId,
        { isActive: false },
        { new: true }
      );

      res.json({
        success: true,
        message: "Offer deactivated successfully",
        data: updatedOffer
      });
    }

  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer"
    });
  }
};

// Toggle Offer Status (Active/Inactive)
const toggleOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { isActive: !offer.isActive },
      { new: true }
    ).populate("storeId", "storeName profileImage averageRating place phone")

    res.json({
      success: true,
      message: `Offer ${updatedOffer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedOffer
    });

  } catch (error) {
    console.error("Toggle offer status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle offer status"
    });
  }
};

// Delete Expired Offers (Auto cleanup function)
const deleteExpiredOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Find all expired offers
    const expiredOffers = await Offer.find({
      validTo: { $lt: currentDate }
    });

    if (expiredOffers.length === 0) {
      return res.json({
        success: true,
        message: "No expired offers found",
        deletedCount: 0
      });
    }

    // Delete expired offers
    const deleteResult = await Offer.deleteMany({
      validTo: { $lt: currentDate }
    });

    // Also remove these offers from user seen offers to clean up
    const expiredOfferIds = expiredOffers.map(offer => offer._id);
    await UserSeenOffer.updateMany(
      { seenOffers: { $in: expiredOfferIds } },
      { $pull: { seenOffers: { $in: expiredOfferIds } } }
    );

    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} expired offers`,
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error("Delete expired offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expired offers"
    });
  }
};

// Cleanup Expired Offers (Background function - no response needed)
const cleanupExpiredOffers = async () => {
  try {
    const currentDate = new Date();
    
    // Find expired offer IDs first
    const expiredOffers = await Offer.find({
      validTo: { $lt: currentDate }
    }).select('_id');

    if (expiredOffers.length === 0) {
      console.log('No expired offers to clean up');
      return { deletedCount: 0 };
    }

    // Delete expired offers
    const deleteResult = await Offer.deleteMany({
      validTo: { $lt: currentDate }
    });

    // Clean up user seen offers
    const expiredOfferIds = expiredOffers.map(offer => offer._id);
    await UserSeenOffer.updateMany(
      { seenOffers: { $in: expiredOfferIds } },
      { $pull: { seenOffers: { $in: expiredOfferIds } } }
    );

    console.log(`Cleaned up ${deleteResult.deletedCount} expired offers`);
    return { deletedCount: deleteResult.deletedCount };

  } catch (error) {
    console.error("Cleanup expired offers error:", error);
    throw error;
  }
};

// Search Offers
const searchOffers = async (req, res) => {
  try {
    const { q, category, lat, lng, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    let query = {
      isActive: true,
      validTo: { $gte: new Date() },
      $or: [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { tags: new RegExp(q, "i") }
      ]
    };

    if (category) {
      query.category = category;
    }

    // Add location filter if provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 10000 // 10km for search
        }
      };
    }

    const offers = await Offer.find(query)
    .populate("storeId", "storeName profileImage averageRating place phone")
      .sort({ isPremium: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: offers,
      query: q
    });

  } catch (error) {
    console.error("Search offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search offers"
    });
  }
};

module.exports = {
  createOffer,
  getNearbyOffers,
  markOfferSeen,
  getOfferDetails,
  getStoreOffers,
  getOffersByShopId,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  deleteExpiredOffers,
  cleanupExpiredOffers,
  searchOffers
};