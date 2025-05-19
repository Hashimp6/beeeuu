const mongoose = require("mongoose");
const User = require("../models/userModel");
const Store = require("../models/storeModel");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary"); 
require('dotenv').config();

// Create a new store and update user to seller role
const { Client } = require("@googlemaps/google-maps-services-js");
const Product = require("../models/ProductModel");
const Gallery = require("../models/galleryModel");

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
           console.log(`Geocoded ${place} to: ${locationData.lat}, ${locationData.lng}`);
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
            console.log(`Geocoded updated place ${updateData.place} to: ${locationData.lat}, ${locationData.lng}`);
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
  
  
  module.exports = {
    registerStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore,
    findNearestSellers
  };