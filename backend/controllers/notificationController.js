const User = require("../models/userModel");

const updatePushToken = async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    console.log("🛬 Received request:", { userId, pushToken });

    if (!userId || !pushToken) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or pushToken",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.pushTokens.includes(pushToken)) {
      user.pushTokens.push(pushToken);
      await user.save();
      console.log("✅ Token added. Final pushTokens array:", user.pushTokens);
    } else {
      console.log("🔁 Token already exists:", pushToken);
    }

    return res.status(200).json({
      success: true,
      message: "Push token updated successfully",
    });
  } catch (error) {
    console.error("❌ Failed to update push token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update push token",
      error: error.message,
    });
  }
};

const removePushToken = async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    if (!userId || !pushToken) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or pushToken",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out the token
    user.pushTokens = user.pushTokens.filter((token) => token !== pushToken);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Push token removed successfully",
    });
  } catch (error) {
    console.error("❌ Failed to remove push token:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  updatePushToken,
  removePushToken,
};

