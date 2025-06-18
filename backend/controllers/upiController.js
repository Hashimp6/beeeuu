// controllers/storeController.js
const Store = require("../models/storeModel");

const updateUPI = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { upi } = req.body;

    if (!upi) {
      return res.status(400).json({ message: "UPI is required" });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { upi },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    console.log("doone");
    res.status(200).json({
        success:true,
      message: "UPI updated successfully",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Error updating UPI:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getStoreUPI = async (req, res) => {
    try {
      const { storeId } = req.params;
  
      if (!storeId) {
        return res.status(400).json({ message: "Store ID is required" });
      }
  
      const store = await Store.findById(storeId).select("upi");
  
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
  
      res.status(200).json({
        success: true,
        upi: store.upi || null,
      });
    } catch (error) {
      console.error("Error fetching store UPI:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch UPI",
        error: error.message,
      });
    }
  };

module.exports = {
  updateUPI,getStoreUPI
};
