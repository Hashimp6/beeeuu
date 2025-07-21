const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadOfferImage } = require("../config/multer");

const {
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
  searchOffers,
} = require("../controllers/offersController");

// ✅ Create a new offer (image upload)
router.post("/", uploadOfferImage.single("image"), createOffer);

// ✅ Get nearby offers for logged-in users
router.get("/nearby", protect, getNearbyOffers);

// ✅ Search offers by keyword/category/location
router.get("/search", searchOffers);

// ✅ Get details of a specific offer
router.get("/:offerId", getOfferDetails);

// ✅ Get all offers for a specific store
router.get("/store/:storeId", getStoreOffers);

// ✅ Get all offers by shop ID (admin/store)
router.get("/shop/:shopId", getOffersByShopId);

// ✅ Mark an offer as seen (logged-in user only)
router.post("/seen", protect, markOfferSeen);

// ✅ Update an offer
router.put("/:offerId", uploadOfferImage.single("image"), updateOffer);

// ✅ Delete an offer (soft or permanent)
router.delete("/:offerId", deleteOffer);

// ✅ Toggle offer status (active/inactive)
router.patch("/:offerId/toggle", toggleOfferStatus);

// ✅ Delete expired offers (admin cleanup)
router.delete("/cleanup/expired", deleteExpiredOffers);

module.exports = router;
