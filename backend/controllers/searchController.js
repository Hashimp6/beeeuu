const Store = require('../models/storeModel'); // Adjust path as needed

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Search stores with multiple filters
const searchStores = async (req, res) => {
  try {
    const {
      category,
      search,
      latitude,
      longitude,
      radius = 10,
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Text search in storeName, category, and description
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location-based search
    if (latitude && longitude) {
      const radiusInRadians = radius / 6371;
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians]
        }
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute the search query
    const stores = await Store.find(query)
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalStores = await Store.countDocuments(query);
    const totalPages = Math.ceil(totalStores / parseInt(limit));

    // If location is provided, calculate distance for each store
    let storesWithDistance = stores;
    if (latitude && longitude) {
      storesWithDistance = stores.map(store => {
        if (store.location && store.location.coordinates) {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            store.location.coordinates[1], // latitude
            store.location.coordinates[0]  // longitude
          );
          return { ...store, distance: Math.round(distance * 100) / 100 };
        }
        return store;
      });

      // Sort by distance if location search is used
      if (sortBy === 'distance') {
        storesWithDistance.sort((a, b) => {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return sortOrder === 'asc' ? distA - distB : distB - distA;
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
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
          category,
          search,
          location: latitude && longitude ? { latitude, longitude, radius } : null
        }
      }
    });

  } catch (error) {
    console.error('Search stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching stores',
      error: error.message
    });
  }
};

// Get stores by category
const getStoresByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 20, latitude, longitude } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Map frontend category names to backend categories
    const categoryMapping = {
      'face-services': 'Face',
      'hair-services': 'Hair',
      'makeup-services': 'Makeup',
      'nail-services': 'Nails',
      'henna-services': 'Henna',
      'skincare-services': 'Skincare',
      'eyebrow-services': 'Eyebrows',
      'massage-services': 'Massage'
    };

    const mappedCategory = categoryMapping[categoryName] || categoryName;

    const stores = await Store.find({ 
      category: { $regex: mappedCategory, $options: 'i' } 
    })
      .populate('userId', 'name email')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalStores = await Store.countDocuments({ 
      category: { $regex: mappedCategory, $options: 'i' } 
    });

    // Add distance calculation if coordinates provided
    let storesWithDistance = stores;
    if (latitude && longitude) {
      storesWithDistance = stores.map(store => {
        if (store.location && store.location.coordinates) {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            store.location.coordinates[1],
            store.location.coordinates[0]
          );
          return { ...store, distance: Math.round(distance * 100) / 100 };
        }
        return store;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stores: storesWithDistance,
        category: mappedCategory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStores / parseInt(limit)),
          totalStores,
          limit: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(totalStores / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get stores by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores by category',
      error: error.message
    });
  }
};

const searchQuery = async (req, res) => {
    try {
      const {
        q, // search query
        category,
        latitude,
        longitude,
        radius = 10,
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc'
      } = req.query;
  
      if (!q && !category && !latitude) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a search query, category, or location'
        });
      }
  
      let query = {};
      
      // Text search across multiple fields
      if (q) {
        query.$or = [
          { storeName: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { place: { $regex: q, $options: 'i' } }
        ];
      }
  
      // Category filter
      if (category) {
        const categoryCondition = { category: { $regex: category, $options: 'i' } };
        if (query.$or) {
          query.$and = [{ $or: query.$or }, categoryCondition];
          delete query.$or;
        } else {
          query = { ...query, ...categoryCondition };
        }
      }
      
      // Location-based search
      if (latitude && longitude) {
        const radiusInRadians = radius / 6371;
        const locationCondition = {
          location: {
            $geoWithin: {
              $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians]
            }
          }
        };
        
        if (query.$and) {
          query.$and.push(locationCondition);
        } else if (query.$or) {
          query = { $and: [{ $or: query.$or }, locationCondition] };
          delete query.$or;
        } else {
          query = { ...query, ...locationCondition };
        }
      }
  
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
      // Execute the search query
      const stores = await Store.find(query)
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
  
      // Get total count for pagination
      const totalStores = await Store.countDocuments(query);
      const totalPages = Math.ceil(totalStores / parseInt(limit));
  
      // If location is provided, calculate distance for each store
      let storesWithDistance = stores;
      if (latitude && longitude) {
        storesWithDistance = stores.map(store => {
          if (store.location && store.location.coordinates) {
            const distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              store.location.coordinates[1], // latitude
              store.location.coordinates[0]  // longitude
            );
            return { ...store, distance: Math.round(distance * 100) / 100 };
          }
          return store;
        });
  
        // Sort by distance if location search is used
        if (sortBy === 'distance') {
          storesWithDistance.sort((a, b) => {
            const distA = a.distance || Infinity;
            const distB = b.distance || Infinity;
            return sortOrder === 'asc' ? distA - distB : distB - distA;
          });
        }
      }
  
      res.status(200).json({
        success: true,
        data: {
          stores: storesWithDistance,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalStores,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
            limit: parseInt(limit)
          },
          searchParams: {
            query: q,
            category,
            location: latitude && longitude ? { latitude, longitude, radius } : null,
            sortBy,
            sortOrder
          }
        }
      });
  
    } catch (error) {
      console.error('Search query error:', error);
      res.status(500).json({
        success: false,
        message: 'Error performing search',
        error: error.message
      });
    }
  };
  
  // Search suggestions based on partial input
  const searchSuggestions = async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
  
      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query must be at least 2 characters long'
        });
      }
  
      // Get store name suggestions
      const storeNames = await Store.find({
        storeName: { $regex: q, $options: 'i' }
      })
        .select('storeName')
        .limit(parseInt(limit) / 2)
        .lean();
  
      // Get category suggestions
      const categories = await Store.distinct('category', {
        category: { $regex: q, $options: 'i' }
      });
  
      // Get place suggestions
      const places = await Store.distinct('place', {
        place: { $regex: q, $options: 'i' }
      });
  
      const suggestions = {
        stores: storeNames.map(store => ({
          type: 'store',
          text: store.storeName,
          value: store.storeName
        })),
        categories: categories.slice(0, 3).map(category => ({
          type: 'category',
          text: category,
          value: category
        })),
        places: places.slice(0, 3).map(place => ({
          type: 'place',
          text: place,
          value: place
        }))
      };
  
      res.status(200).json({
        success: true,
        data: suggestions
      });
  
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting search suggestions',
        error: error.message
      });
    }
  };
  
  // Get popular search terms
  const getPopularSearches = async (req, res) => {
    try {
      // Get most common categories
      const popularCategories = await Store.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { category: '$_id', count: 1, _id: 0 } }
      ]);
  
      // Get most common places
      const popularPlaces = await Store.aggregate([
        { $match: { place: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: '$place', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { place: '$_id', count: 1, _id: 0 } }
      ]);
  
      res.status(200).json({
        success: true,
        data: {
          popularCategories: popularCategories.map(item => item.category),
          popularPlaces: popularPlaces.map(item => item.place)
        }
      });
  
    } catch (error) {
      console.error('Get popular searches error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting popular searches',
        error: error.message
      });
    }
  };
  
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



module.exports = {
  searchStores,
  getStoresByCategory,
  searchQuery,
  searchSuggestions,
  getPopularSearches,
  checkStoreNameAvailability
};