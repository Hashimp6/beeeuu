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
  getStoreUpi,
  getNearbyStores,
  findStoreByName,
  updateUPI,
  updateServiceType,
  updatePaymentType,
  updateRazorpayCredentials,
  getRazorpayCredentials,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require("../controllers/storeController");
const { protect, authorize } = require("../middleware/auth");
const { uploadStoreImage } = require("../config/multer");
const { getStoreAnalytics, getStoreRevenue } = require("../controllers/analysisController");


router.get('/storeprofile/:name', findStoreByName);
router.get("/nearby",getNearbyStores);
 router.get("/:storeId", getStoreById);
 router.get("/user/:userId", getStoreByUserId);
 router.get("/checkName", checkStoreNameAvailability);
 router.get('/:storeId/upi', getStoreUpi);
 router.put('/update-upi/:storeId',updateUPI);
 //for store analetics
router.get("/store-analetics/:storeId", getStoreAnalytics);
//for revenue
router.get('/revenue/:storeId', getStoreRevenue);
// Apply authentication middleware to all routes
// PUT /stores/:storeId/service-type
router.put('/:storeId/service-type', updateServiceType);

// PUT /stores/:storeId/payment-type
router.put('/:storeId/payment-type', updatePaymentType);

router.put('/:id/razorpay', updateRazorpayCredentials);       // 🔐 Save encrypted
router.get('/:id/razorpay', getRazorpayCredentials); 
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify-payment', verifyRazorpayPayment);
router.use(protect);

// Register a new store - use uploadStoreImage middleware
router.post("/register", uploadStoreImage.single("profileImage"), registerStore);

// Get all stores (admin only)
router.get("/", authorize("admin"), getAllStores);

// Get store by ID
// router.get("/:storeId", getStoreById);

// Update store - use uploadStoreImage middleware
router.put("/:storeId", uploadStoreImage.single("profileImage"), updateStore);
//edit store types

// Delete store
router.delete("/:storeId", authorize("seller", "admin"), deleteStore);



module.exports = router;