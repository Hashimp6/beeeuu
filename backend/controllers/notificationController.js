const User = require("../models/userModel");

const updatePushToken = async (req, res) => {
  try {
    console.log("dddd",req.body);
    
    const { pushToken,userId } = req.body;
console.log("jj",userId);

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    await User.findByIdAndUpdate(userId, { pushToken });

    res.status(200).json({
      success: true,
      message: "Push token updated successfully",
    });
  } catch (error) {
    console.error("Update push token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update push token",
      error: error.message,
    });
  }
};

module.exports = {
  updatePushToken,
};
