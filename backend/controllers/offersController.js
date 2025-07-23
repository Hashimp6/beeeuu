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
// const getNearbyOffers = async (req, res) => {
//   try {
//     const { 
//       lat, 
//       lng, 
//       category, 
//       storeName, 
//       lastDistance = 0, 
//       lastOfferId,
//       userId,
//       tempUserId ,
 
//       batchSize = 20 // Fetch 20 offers at once
//     } = req.query;
    
//     const UserId = req.user?._id ||userId|| tempUserId;

//     if (!UserId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "User ID or temp ID is required" 
//       });
//     }
    
//     // Then based on type, fetch seen offers
//     let seenOfferRecord = await UserSeenOffer.findOne({ UserId });
//     // Location is essential - always required
//     if (!lat || !lng) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Latitude and longitude are required" 
//       });
//     }
    

//     const seenOfferIds = seenOfferRecord ? seenOfferRecord.seenOffers : [];
    
//     // Build base query
//     let matchQuery = {
//       isActive: true,
//       validTo: { $gte: new Date() },
//       _id: { $nin: seenOfferIds }
//     };
    
//     // Add category filter only if specified (optional)
//     if (category && category.trim() !== '') {
//       matchQuery.category = category;
//     }
    
//     // Add store filter if provided
//     if (storeName && storeName.trim() !== '') {
//       const storeMatches = await Store.find({ 
//         storeName: new RegExp(storeName, "i") 
//       }).select("_id");
      
//       if (storeMatches.length > 0) {
//         matchQuery.storeId = { $in: storeMatches.map(s => s._id) };
//       } else {
//         return res.json({
//           success: true,
//           data: [],
//           hasMore: false,
//           message: "No stores found with that name"
//         });
//       }
//     }
    
//     // Exclude last fetched offer to avoid duplicates
//     if (lastOfferId) {
//       matchQuery._id = { 
//         $nin: [...seenOfferIds, lastOfferId] 
//       };
//     }
    
//     // Optimized batch fetching pipeline
//     const pipeline = [
//       {
//         $geoNear: {
//           near: { 
//             type: "Point", 
//             coordinates: [parseFloat(lng), parseFloat(lat)] 
//           },
//           distanceField: "distance",
//           spherical: true,
//           query: matchQuery
//         }
//       },
//       {
//         // Progressive distance filter
//         $match: {
//           distance: { $gte: parseFloat(lastDistance) }
//         }
//       },
//       {
//         // Sort: Premium first, then closest distance
//         $sort: { 
//           isPremium: -1, 
//           distance: 1,
//           createdAt: -1
//         }
//       },
//       {
//         // Fetch batch of offers (20 by default)
//         $limit: parseInt(batchSize)
//       },
//       {
//         // Add formatted distances
//         $addFields: {
//           distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
//           distanceM: { $round: ["$distance", 0] }
//         }
//       }
//     ];
    
//     const offers = await Offer.aggregate(pipeline);
    
//     if (offers.length === 0) {
//       return res.json({
//         success: true,
//         data: [],
//         hasMore: false,
//         message: parseFloat(lastDistance) === 0 ? 
//           "No offers available in your area" : 
//           "No more offers available"
//       });
//     }
    
//     // Bulk populate for better performance
//     await Offer.populate(offers, {
//       path: 'storeId',
//       select: 'storeName profileImage averageRating place phone'
//     });
    
//     // Get the farthest distance from current batch for next API call
//     const lastOfferInBatch = offers[offers.length - 1];
//     const maxDistance = Math.max(...offers.map(offer => offer.distance));
    
//     // Quick check if more offers exist beyond this batch
//     const hasMoreCheck = await Offer.aggregate([
//       {
//         $geoNear: {
//           near: { 
//             type: "Point", 
//             coordinates: [parseFloat(lng), parseFloat(lat)] 
//           },
//           distanceField: "distance",
//           spherical: true,
//           query: {
//             ...matchQuery,
//             _id: { 
//               $nin: [
//                 ...seenOfferIds, 
//                 ...offers.map(o => o._id)
//               ] 
//             }
//           }
//         }
//       },
//       {
//         $match: {
//           distance: { $gte: maxDistance }
//         }
//       },
//       {
//         $limit: 1
//       }
//     ]);
    
//     // Response optimized for batch handling
//     res.json({
//       success: true,
//       data: offers,
//       batchInfo: {
//         size: offers.length,
//         hasMore: hasMoreCheck.length > 0,
//         nextParams: {
//           lastDistance: maxDistance,
//           lastOfferId: lastOfferInBatch._id.toString()
//         }
//       }
//     });
    
//   } catch (error) {
//     console.error("Get nearby offers error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Failed to fetch offers" 
//     });
//   }
// };
const getNearbyOffers = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      category, 
      storeName, 
      skip = 0,  // Simple pagination - how many offers to skip
      userId,
      tempUserId,
      batchSize = 20
    } = req.query;
    
    const UserId = req.user?._id || userId || tempUserId;

    if (!UserId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID or temp ID is required" 
      });
    }
    
    // Location is required
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }
    
    // Get seen offers to exclude them
    let seenOfferRecord = await UserSeenOffer.findOne({ UserId });
    const seenOfferIds = seenOfferRecord ? seenOfferRecord.seenOffers : [];
    
    // Build base query
    let matchQuery = {
      isActive: true,
      validTo: { $gte: new Date() },
      _id: { $nin: seenOfferIds }  // Exclude seen offers
    };
    
    // Add optional filters
    if (category && category.trim() !== '') {
      matchQuery.category = category;
    }
    
    if (storeName && storeName.trim() !== '') {
      const storeMatches = await Store.find({ 
        storeName: new RegExp(storeName, "i") 
      }).select("_id");
      
      if (storeMatches.length > 0) {
        matchQuery.storeId = { $in: storeMatches.map(s => s._id) };
      } else {
        return res.json({
          success: true,
          data: [],
          hasMore: false,
          message: "No stores found with that name"
        });
      }
    }
    
    // SIMPLE PIPELINE - Just get nearest offers
    const pipeline = [
      {
        $geoNear: {
          near: { 
            type: "Point", 
            coordinates: [parseFloat(lng), parseFloat(lat)] 
          },
          distanceField: "distance",
          spherical: true,
          query: matchQuery
        }
      },
      {
        // Sort by: Premium first, then distance (nearest first)
        $sort: { 
          isPremium: -1, 
          distance: 1
        }
      },
      {
        // Skip offers from previous batches
        $skip: parseInt(skip)
      },
      {
        // Get batch of offers
        $limit: parseInt(batchSize)
      },
      {
        // Add readable distance
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
          distanceM: { $round: ["$distance", 0] }
        }
      }
    ];
    
    const offers = await Offer.aggregate(pipeline);
    
    // Populate store details
    await Offer.populate(offers, {
      path: 'storeId',
      select: 'storeName profileImage averageRating place phone'
    });
    
    // Check if more offers exist
    const totalOffers = await Offer.aggregate([
      {
        $geoNear: {
          near: { 
            type: "Point", 
            coordinates: [parseFloat(lng), parseFloat(lat)] 
          },
          distanceField: "distance",
          spherical: true,
          query: matchQuery
        }
      },
      {
        $count: "total"
      }
    ]);
    
    const totalCount = totalOffers[0]?.total || 0;
    const hasMore = (parseInt(skip) + offers.length) < totalCount;
    
    res.json({
      success: true,
      data: offers,
      pagination: {
        currentBatch: offers.length,
        skip: parseInt(skip),
        hasMore: hasMore,
        nextSkip: hasMore ? parseInt(skip) + offers.length : null
      },
      message: offers.length === 0 ? "No more offers available" : undefined
    });
    
  } catch (error) {
    console.error("Get nearby offers error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch offers" 
    });
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