const User = require("../models/userModel");

const updatePushToken = async (req, res) => {
 
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { pushToken: pushToken },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Push token updated successfully', user: updatedUser });
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
