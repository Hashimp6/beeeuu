const User = require("../models/userModel");

const updatePushToken = async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
console.log("uff",userId, pushToken );

    if (!userId || !pushToken) {
      return res.status(400).json({ success: false, message: "Missing userId or pushToken" });
    }

    // Update the user's push token in DB
   const updatedUser= await User.findByIdAndUpdate(userId, { pushToken } ,{ new: true });
console.log("uppu",updatedUser);

    return res.status(200).json({
      success: true,
      message: "Push token updated successfully",
    });
  } catch (error) {
    console.error("❌ [SERVER] Failed to update push token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update push token",
      error: error.message,
    });
  }
};

module.exports = {
  updatePushToken,
};
