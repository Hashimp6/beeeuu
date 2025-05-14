const express = require("express");
const router = express.Router();
const { 
  registerStore, 
  getAllStores, 
  getStoreById, 
  updateStore, 
  deleteStore,
  uploadStoreImage,
  findNearestSellers
} = require("../controllers/storeController");
const { protect, authorize } = require("../middleware/auth");


router.get("/nearby", findNearestSellers);
// Apply authentication middleware to all routes
router.use(protect);

// Register a new store - use uploadStoreImage middleware
router.post("/register", uploadStoreImage, registerStore);

// Get all stores (admin only)
router.get("/", authorize("admin"), getAllStores);

// Get store by ID
router.get("/:storeId", getStoreById);

// Update store - use uploadStoreImage middleware
router.put("/:storeId", authorize("seller", "admin"), uploadStoreImage, updateStore);

// Delete store
router.delete("/:storeId", authorize("seller", "admin"), deleteStore);

module.exports = router;