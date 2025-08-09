const mongoose = require("mongoose");
const User = require("../models/userModel");
const Store = require("../models/storeModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary"); 
require('dotenv').config();

// Create a new store and update user to seller role
const { Client } = require("@googlemaps/google-maps-services-js");
const Product = require("../models/ProductModel");
const Gallery = require("../models/galleryModel");
const { decrypt, encrypt } = require("../utils/encription");

// Initialize Google Maps client
const googleMapsClient = new Client({});

const registerStore = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already registered a store
    if (user.role === "seller" && user.storeId) {
      return res.status(400).json({ message: "User already registered a store" });
    }
    const { storeName, description, place,category, phone } = req.body;
    
    // Parse socialMedia string if it exists
    let socialMedia = {};
    if (req.body.socialMedia) {
      try {
        socialMedia = JSON.parse(req.body.socialMedia);
      } catch (e) {
        console.error("Error parsing socialMedia:", e);
        socialMedia = {};
      }
    }
    
    // Get the Cloudinary URL from the uploaded file
    let profileImage = "";
    if (req.file && req.file.path) {
      profileImage = req.file.path;
    }

     // Initialize location field
     let location = null;

     // Convert place to coordinates using Google Maps Geocoding API
     if (place) {
       try {
         const response = await googleMapsClient.geocode({
           params: {
             address: place,
             key: process.env.GOOGLE_MAPS_API_KEY
           }
         });
         
         if (response.data.results && response.data.results.length > 0) {
           const locationData = response.data.results[0].geometry.location;
           location = {
             type: "Point",
             coordinates: [locationData.lng, locationData.lat] // [longitude, latitude] order
           };
         } else {
           console.warn(`Could not geocode address: ${place}`);
         }
       } catch (error) {
         console.error("Error geocoding address:", error);
         // Continue with store creation even if geocoding fails
       }
     }
 
    // Create a new store with lat and long
    const newStore = new Store({
      userId,
      storeName,
      description,
      profileImage,
      place,
      category,
      location,
      phone,
      socialMedia: {
        whatsapp: socialMedia?.whatsapp || "",
        instagram: socialMedia?.instagram || "",
        facebook: socialMedia?.facebook || "",
        website: socialMedia?.website || "",
      },
    });

    // Save the store
    const savedStore = await newStore.save();

   
    user.role = "seller";
    user.storeId = savedStore._id;
    await user.save();

    res.status(201).json({
      message: "Store created successfully and user updated to seller",
      store: savedStore,
    });
  } catch (error) {
    console.error("Error registering store:", error);
    res.status(500).json({ message: "Failed to register store", error: error.message });
  }
};
  
  // Get all stores
  const getAllStores = async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource"
        });
      }
      const stores = await Store.find();
          
      res.status(200).json({
        success: true,
        count: stores.length,
        stores
      });
    } catch (error) {
      console.error("Error getting stores:", error);
      res.status(500).json({ message: "Failed to get stores", error: error.message });
    }
  };
  
  // Get store by ID
  const getStoreById = async (req, res) => {
    try {
      const { storeId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
  
      // Fetch store, products, and gallery in parallel
      const [store, products, gallery] = await Promise.all([
        Store.findById(storeId),
        Product.find({ store: storeId }),
        Gallery.find({ store: storeId }),
      ]);
  
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      res.status(200).json({ store, products, gallery });
    } catch (error) {
      console.error("Error getting seller profile:", error);
      res.status(500).json({ message: "Failed to get seller profile", error: error.message });
    }
  };
  const getStoreByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Correct: filter object and await
      const store = await Store.findOne({ userId });
  
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      // Convert to plain object to avoid Mongoose circular refs
      res.status(200).json(store.toObject());
    } catch (error) {
      console.error("Error getting seller profile:", error);
      res.status(500).json({ message: "Failed to get seller profile", error: error.message });
    }
  };
  
  // Update store
  const updateStore = async (req, res) => {
    try {
      const { storeId } = req.params;
      const updateData = { ...req.body };
      // Handle image update if file is provided
      if (req.file && req.file.path) {
        updateData.profileImage = req.file.path;
        
        // Delete the old image from Cloudinary if it exists
        const store = await Store.findById(storeId);
        if (store && store.profileImage) {
          const publicId = store.profileImage.split('/').pop().split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`store_profiles/${publicId}`);
          }
        }
      }
  
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
  
      // Parse socialMedia if it comes as a string
      if (typeof updateData.socialMedia === 'string') {
        try {
          updateData.socialMedia = JSON.parse(updateData.socialMedia);
        } catch (e) {
          console.error("Error parsing socialMedia for update:", e);
          delete updateData.socialMedia;
        }
      }
      
      // Get the current store to check if place has changed
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      // Handle location update from direct coordinates
      if (updateData.latitude && updateData.longitude) {
        const lat = parseFloat(updateData.latitude);
        const lng = parseFloat(updateData.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          updateData.location = {
            type: "Point",
            coordinates: [lng, lat] // MongoDB uses [longitude, latitude] order
          };
          // Remove individual lat/lng fields as they're now in the location field
          delete updateData.latitude;
          delete updateData.longitude;
        }
      }
  
      // If place is updated, try to geocode the new address
      if (updateData.place && updateData.place !== store.place) {
        try {
          const response = await googleMapsClient.geocode({
            params: {
              address: updateData.place,
              key: process.env.GOOGLE_MAPS_API_KEY
            }
          });
          
          if (response.data.results && response.data.results.length > 0) {
            const locationData = response.data.results[0].geometry.location;
            updateData.location = {
              type: "Point",
              coordinates: [locationData.lng, locationData.lat] // [longitude, latitude] order
            };
        } else {
            console.warn(`Could not geocode updated address: ${updateData.place}`);
          }
        } catch (error) {
          console.error("Error geocoding address for update:", error);
          // Continue with update even if geocoding fails
        }
      }
  
      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
  
      if (!updatedStore) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      res.status(200).json({
        message: "Store updated successfully",
        store: updatedStore,
      });
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ message: "Failed to update store", error: error.message });
    }
  };
 
  // Find nearest sellers based on user location
const findNearestSellers = async (req, res) => {
    try {
      // Get the user's latitude and longitude from the request
      const { latitude, longitude, limit = 30 } = req.query;
      
      // Validate inputs
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: "Valid latitude and longitude are required"
        });
      }
      
      
      // Convert limit to integer and set a default if invalid
      const resultLimit = !isNaN(parseInt(limit)) ? parseInt(limit) : 30;
      
      // Find stores near the specified coordinates
      const nearbyStores = await Store.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat] // MongoDB uses [longitude, latitude] order
            }
          }
        }
      }).limit(resultLimit);
      
      // Calculate actual distances and add to response
      const storesWithDistance = nearbyStores.map(store => {
        // Calculate distance in kilometers using Haversine formula
        if (store.location && store.location.coordinates) {
          const [storeLng, storeLat] = store.location.coordinates;
          const distanceInMeters = calculateDistance(
            lat, lng, 
            storeLat, storeLng
          );
          
          return {
            ...store.toObject(),
            distance: {
              meters: Math.round(distanceInMeters),
              kilometers: Math.round(distanceInMeters / 100) / 10 // Round to 1 decimal place
            }
          };
        } else {
          return store.toObject();
        }
      });
      
      res.status(200).json({
        success: true,
        count: nearbyStores.length,
        stores: storesWithDistance
      });
    } catch (error) {
      console.error("Error finding nearest sellers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to find nearest sellers",
        error: error.message
      });
    }
  };
  
  // Helper function to calculate distance using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    
    return distance;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }
  
  // Delete store
  const deleteStore = async (req, res) => {
    try {
      const { storeId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
  
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      // Delete the image from Cloudinary if it exists
      if (store.profileImage) {
        const publicId = store.profileImage.split('/').pop().split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`store_profiles/${publicId}`);
        }
      }
  
      // Update the user associated with this store
      await User.findOneAndUpdate(
        { storeId: storeId },
        {
          $unset: { storeId: "" },
          $set: { role: "user" }
        }
      );
        
      // Delete the store
      await Store.findByIdAndDelete(storeId);
  
      res.status(200).json({ message: "Store deleted successfully and user role updated" });
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Failed to delete store", error: error.message });
    }
  };


// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}
const checkStoreNameAvailability = async (req, res) => {
  try {
  
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Store name is required" });
    }

    const existingStore = await Store.findOne({
      storeName: { $regex: `^${name}$`, $options: "i" }, // case-insensitive exact match
    });

    if (existingStore) {
      return res.json({ available: false, message: "Store name already exists" });
    }

    return res.json({ available: true, message: "Store name is available" });
  } catch (err) {
    console.error("Error checking store name:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStoreUpi = async (req, res) => {
  const { storeId } = req.params;

  try {
    const store = await Store.findById(storeId).select('upi name');

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(200).json({ success: true, upi: store.upi, storeName: store.name });
  } catch (error) {
    console.error('Error fetching UPI:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getNearbyStores = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 50, // Default radius in kilometers (matching your frontend default)
      page = 1,
      limit = 20,
      sortBy = 'distance', // 'distance', 'averageRating', 'storeName'
      sortOrder = 'asc', // 'asc' or 'desc'
      category, // Optional category filter
      search // Optional search term
    } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

  

    // Build aggregation pipeline
    let pipeline = [];

    // Step 1: Use $geoNear for location-based search (must be first stage)
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: 'distance',
        maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        spherical: true,
        distanceMultiplier: 0.001 // Convert distance from meters to kilometers
      }
    });

    // Step 2: Build match conditions for additional filters
    let matchConditions = {};

    // Category filter
    if (category && category.trim() !== '') {
      matchConditions.category = { $regex: category.trim(), $options: 'i' };
    }

    // Search filter (search in storeName, description, place)
    if (search && search.trim() !== '') {
      matchConditions.$or = [
        { storeName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { place: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Add match stage if we have conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Step 3: Populate user information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [{ $project: { username: 1, email: 1, phone: 1 } }]
      }
    });

    // Step 4: Add computed fields and format
    pipeline.push({
      $addFields: {
        distance: { $round: ['$distance', 2] }, // Round distance to 2 decimal places
        user: { $arrayElemAt: ['$userInfo', 0] }
      }
    });

    // Step 5: Remove the userInfo array since we have user field now
    pipeline.push({
      $project: {
        userInfo: 0
      }
    });

    // Create a copy of pipeline for counting total documents
    let countPipeline = [...pipeline];

    // Step 6: Apply sorting
    let sortStage = {};
    
    switch (sortBy) {
      case 'distance':
        sortStage.distance = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'averageRating':
        sortStage.averageRating = sortOrder === 'desc' ? -1 : 1;
        // Secondary sort by distance for stores with same rating
        sortStage.distance = 1;
        break;
      case 'storeName':
        sortStage.storeName = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortStage.distance = 1; // Default to distance ascending
    }

    pipeline.push({ $sort: sortStage });

    // Step 7: Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute the main query
    const stores = await Store.aggregate(pipeline);

    // Get total count for pagination
    countPipeline.push({ $count: 'total' });
    const countResult = await Store.aggregate(countPipeline);
    const totalStores = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalStores / parseInt(limit));

    // Format the response
    const formattedStores = stores.map(store => ({
      _id: store._id,
      storeName: store.storeName,
      description: store.description,
      profileImage: store.profileImage,
      place: store.place,
      category: store.category,
      rating: store.rating,
      averageRating: store.averageRating || 0,
      numberOfRatings: store.numberOfRatings || 0,
      location: store.location,
      distance: store.distance,
      upi: store.upi,
      phone: store.phone,
      socialMedia: store.socialMedia,
      user: store.user,
      createdAt: store.createdAt
    }));

    // Response data
    const responseData = {
      stores: formattedStores,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStores,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      filters: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: parseFloat(radius)
        },
        sortBy,
        sortOrder,
        category: category || null,
        search: search || null
      }
    };

   
    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby stores',
      error: error.message
    });
  }
};

// Alternative simpler version without aggregation (if you prefer)
const getNearbyStoresSimple = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 50,
      page = 1,
      limit = 20,
      sortBy = 'distance',
      sortOrder = 'asc',
      category,
      search
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Build query for location
    const radiusInRadians = parseFloat(radius) / 6371; // Convert km to radians
    
    let query = {
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians]
        }
      }
    };

    // Add category filter
    if (category && category.trim() !== '') {
      query.category = { $regex: category.trim(), $options: 'i' };
    }

    // Add search filter
    if (search && search.trim() !== '') {
      query.$or = [
        { storeName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { place: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object (excluding distance since we'll calculate it)
    let sort = {};
    if (sortBy !== 'distance') {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Execute query
    const stores = await Store.find(query)
      .populate('userId', 'username email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate distances and sort by distance if needed
    const storesWithDistance = stores.map(store => {
      let distance = 0;
      if (store.location && store.location.coordinates) {
        distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          store.location.coordinates[1], // latitude
          store.location.coordinates[0]  // longitude
        );
      }
      return {
        ...store,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    // Sort by distance if requested
    if (sortBy === 'distance') {
      storesWithDistance.sort((a, b) => {
        const distA = a.distance || 0;
        const distB = b.distance || 0;
        return sortOrder === 'desc' ? distB - distA : distA - distB;
      });
    }

    // Get total count
    const totalStores = await Store.countDocuments(query);
    const totalPages = Math.ceil(totalStores / parseInt(limit));

    const responseData = {
      stores: storesWithDistance,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStores,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      filters: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: parseFloat(radius)
        },
        sortBy,
        sortOrder,
        category: category || null,
        search: search || null
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby stores',
      error: error.message
    });
  }
};
const findStoreByName = async (req, res) => {
  try {

    let { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: 'Store name is required in URL parameter' });
    }

    // Convert kebab-case to normal case
    name = name.replace(/-/g, ' '); // dianaas-henna -> dianaas henna

    const regex = new RegExp(`^${name}$`, 'i'); // exact, case-insensitive match

    const store = await Store.findOne({ storeName: regex });


    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    return res.status(200).json({ success: true, data: store });
  } catch (error) {
    console.error('Error fetching store by name:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const updateUPI = async (req, res) => {
  const { storeId } = req.params;
  const { upi } = req.body;

  try {
    const store = await Store.findById(storeId);

    if (!store) return res.status(404).json({ message: "Store not found" });

    store.upi = upi;
    await store.save();

    res.status(200).json({ message: "UPI updated successfully", upi: store.upi });
  } catch (error) {
    res.status(500).json({ message: "Error updating UPI", error });
  }
};

const updateServiceType = async (req, res) => {
  const { storeId } = req.params;
  const { serviceType } = req.body;

  if (!Array.isArray(serviceType)) {
    return res.status(400).json({ message: 'serviceType must be an array' });
  }

  try {
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: { serviceType } },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json({
      message: 'Service type updated successfully',
      store: updatedStore,
    });
  } catch (err) {
    console.error('Error updating serviceType:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 2. Update Payment Type
const updatePaymentType = async (req, res) => {
  const { storeId } = req.params;
  const { paymentType } = req.body;
  if (!Array.isArray(paymentType)) {
    return res.status(400).json({ message: 'paymentType must be an array' });
  }

  try {
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: { paymentType } },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json({
      message: 'Payment type updated successfully',
      store: updatedStore,
    });
  } catch (err) {
    console.error('Error updating paymentType:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateRazorpayCredentials = async (req, res) => {
  const { id } = req.params;
  const { key_id, key_secret } = req.body;

  if (!key_id || !key_secret) {
    return res.status(400).json({ message: 'Both Razorpay Key ID and Secret are required.' });
  }

  try {
    const encryptedKeyId = encrypt(key_id);
    const encryptedSecret = encrypt(key_secret);

    const store = await Store.findByIdAndUpdate(
      id,
      {
        razorpay: {
          key_id: encryptedKeyId,
          key_secret: encryptedSecret
        }
      },
      { new: true }
    );

    if (!store) return res.status(404).json({ message: 'Store not found.' });

    res.status(200).json({ message: 'Razorpay credentials updated securely.' });
  } catch (error) {
    console.error('Error updating Razorpay credentials:', error);
    res.status(500).json({ message: 'Server error while updating Razorpay credentials.' });
  }
};

const getRazorpayCredentials = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findById(id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const decryptedKeyId = decrypt(store.razorpay.key_id || '');
    const decryptedSecret = decrypt(store.razorpay.key_secret || '');

    res.status(200).json({
      key_id: decryptedKeyId,
      key_secret: decryptedSecret
    });
  } catch (error) {
    console.error('Error fetching Razorpay credentials:', error);
    res.status(500).json({ message: 'Server error while retrieving Razorpay credentials.' });
  }
};

const createRazorpayOrder = async (req, res) => {
  
  const { amount, currency, receipt, notes } = req.body;
  const storeId = notes.storeId;

  try {
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const key_id = decrypt(store.razorpay.key_id || '');
    const key_secret = decrypt(store.razorpay.key_secret || '');


    const razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount,
      currency,
      receipt,
      notes,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id // Send only public key to frontend
      }
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Server error while creating Razorpay order." });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    // Optional: You may need to fetch store based on notes or metadata
    // For demo, assume storeId is embedded somewhere or passed

    const store = await Store.findOne({ 'razorpay.key_id': { $exists: true } }); // Replace this with correct store lookup
    if (!store) return res.status(404).json({ message: "Store not found" });

    const key_secret = decrypt(store.razorpay.key_secret || '');

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Server error while verifying payment" });
  }
};


const activeStatus= async (req, res) =>{
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle status" });
  }
}




const updateProtectedPages = async (req, res) => {
  const { storeId } = req.params;
  const { pages } = req.body;

  try {
    if (!Array.isArray(pages)) {
      return res.status(400).json({ message: "Pages must be an array." });
    }

    const store = await Store.findByIdAndUpdate(
      storeId,
      { "security.pages": pages },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    res.status(200).json({
      message: "Protected pages updated successfully.",
      updatedPages: store.security.pages,
    });
  } catch (err) {
    console.error("Error updating protected pages:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const updateSecurityPassword = async (req, res) => {
  const { storeId } = req.params;
  const { password } = req.body;

  if (!password || password.trim() === '') {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { 'security.password': password },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({
      message: 'Security password updated successfully',
      security: updatedStore.security,
    });
  } catch (error) {
    console.error('Error updating security password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOnlineTicketing = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    const store = await Store.findByIdAndUpdate(
      storeId,
      { onlineTicketing: updateData },
      { new: true }
    );

    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json({ message: "Online Ticketing Updated", store });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 👇 Update Walking Ticketing
const updateWalkingTicketing = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    const store = await Store.findByIdAndUpdate(
      storeId,
      { walkingTicketing: updateData },
      { new: true }
    );

    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json({ message: "Walking Ticketing Updated", store });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 👇 Update Table Booking
const updateTableBooking = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    const store = await Store.findByIdAndUpdate(
      storeId,
      { tableBooking: updateData },
      { new: true }
    );

    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json({ message: "Table Booking Updated", store });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

  module.exports = {
    
    registerStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore,
    findNearestSellers,
    getStoreByUserId ,
    checkStoreNameAvailability ,
    getStoreUpi,
    getNearbyStores,
    getNearbyStoresSimple,
    findStoreByName,
    updateUPI,
    updateServiceType,
  updatePaymentType,
  updateRazorpayCredentials,
  getRazorpayCredentials,
  verifyRazorpayPayment ,
  createRazorpayOrder,
  activeStatus,
  updateProtectedPages,
  updateSecurityPassword,
  updateOnlineTicketing,
  updateWalkingTicketing,
  updateTableBooking,
  };