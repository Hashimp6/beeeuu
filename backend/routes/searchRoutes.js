const express = require('express');
const router = express.Router();
const {
  searchQuery,
  searchSuggestions,
  getPopularSearches,
  searchStores,
  getStoresByCategory,
  checkStoreNameAvailability
} = require('../controllers/searchController');

// GET /api/stores/search?search=hair&category=Hair&latitude=10&longitude=76&radius=5
router.get('/search', searchStores);

// Get stores by category
// GET /api/stores/category/hair-services
router.get('/category/:categoryName', getStoresByCategory);
// General search endpoint
// GET /api/search/query?q=hair salon&category=Hair&latitude=10&longitude=76
router.get('/query', searchQuery);

// Search suggestions for autocomplete
// GET /api/search/suggestions?q=hai
router.get('/suggestions', searchSuggestions);

// Get popular search terms
// GET /api/search/popular
router.get('/popular', getPopularSearches);
router.get('/checkName', checkStoreNameAvailability);

module.exports = router;