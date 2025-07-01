const express = require("express");
const router = express.Router();
const { 
  registerStore, 
  getAllStores, 
  getStoreById, 
  updateStore, 
  deleteStore,
  findNearestSellers,
  getStoreByUserId,
  checkStoreNameAvailability,
  getStoreUpi
} = require("../controllers/storeController");
const { protect, authorize } = require("../middleware/auth");
const { uploadStoreImage } = require("../config/multer");


router.get("/nearby", findNearestSellers);
 router.get("/:storeId", getStoreById);
 router.get("/user/:userId", getStoreByUserId);
 router.get("/checkName", checkStoreNameAvailability);
 router.get('/:storeId/upi', getStoreUpi);
// Apply authentication middleware to all routes
router.use(protect);

// Register a new store - use uploadStoreImage middleware
router.post("/register", uploadStoreImage.single("profileImage"), registerStore);

// Get all stores (admin only)
router.get("/", authorize("admin"), getAllStores);

// Get store by ID
// router.get("/:storeId", getStoreById);

// Update store - use uploadStoreImage middleware
router.put("/:storeId", uploadStoreImage.single("profileImage"), updateStore);

// Delete store
router.delete("/:storeId", authorize("seller", "admin"), deleteStore);

module.exports = router;