// routes/storeRoutes.js
const express = require("express");
const router = express.Router();
const { updateUPI, getStoreUPI } = require("../controllers/upiController");

// PUT /api/stores/:storeId/upi
router.put("/:storeId/upi", updateUPI);
router.get("/:storeId/upi", getStoreUPI);

module.exports = router;
