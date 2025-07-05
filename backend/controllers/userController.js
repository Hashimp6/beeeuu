const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendMail = require("../config/nodeMailer");
const crypto = require('crypto');


/**
 * User Controller - Handles all user related operations
 */

let registrationStorage = {};
let otpStorage = {};

// Helper to clean up expired registrations and OTPs (should be scheduled to run periodically)
const cleanupStorage = () => {
  const now = Date.now();
  const expiryTime = 30 * 60 * 1000; // 30 minutes

  Object.keys(registrationStorage).forEach(email => {
    if (now - registrationStorage[email].timestamp > expiryTime) {
      delete registrationStorage[email];
      delete otpStorage[email];
    }
  });
};

// Initial registration step
const initiateRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
console.log("name is",name);

    // Check for missing fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered."
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store registration data temporarily
    registrationStorage[email] = {
      username:name,
      email,
      password: hashedPassword,
      timestamp: Date.now()
    };

    // Generate and send OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStorage[email] = {
      otp,
      timestamp: Date.now()
    };

    // Send OTP email
    await sendMail(email, otp);
    console.log("OTP sent:", otp); // For development only, remove in production

    // Clean up expired registrations
    cleanupStorage();

    res.status(200).json({
      message: "OTP sent successfully. Please verify to complete registration."
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
};

// Verify OTP and complete registration
const verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists and is valid
    if (!otpStorage[email] || !registrationStorage[email]) {
      return res.status(400).json({
        message: "OTP expired or registration timeout. Please try again."
      });
    }

    // Verify OTP
    if (otpStorage[email].otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP."
      });
    }

    // Get stored registration data
    const userData = registrationStorage[email];

    // Create new user in database
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      isVerified: true
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Clean up storage
    delete otpStorage[email];
    delete registrationStorage[email];

    // Return user data and token to auto-login the user
    res.status(201).json({
      message: "Registration completed successfully.",
      token,
      user: {
        _id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!registrationStorage[email]) {
      return res.status(400).json({
        message: "Registration session expired. Please start registration again."
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStorage[email] = {
      otp,
      timestamp: Date.now()
    };

    // Send new OTP
    // await sendMail(email, otp);
    console.log("OTP resent:", otp); // For development only, remove in production

    res.status(200).json({
      message: "OTP resent successfully."
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
};
// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user",
      error: error.message
    });
  }
};

// Get user by ID (admin or self only)
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is requesting their own profile or is an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource"
      });
    }

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user",
      error: error.message
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource"
      });
    }

    const users = await User.find().select("-password");
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving users",
      error: error.message
    });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    // Check if user is updating their own profile or is an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user"
      });
    }

    const { username, email, password, role } = req.body;
    
    // Build update object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    // Only admin can update role
    if (role && req.user.role === "admin") {
      updateData.role = role;
    }
    
    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Check for email/username uniqueness if changing those fields
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          { username: username || "" },
          { email: email || "" }
        ],
        _id: { $ne: userId } // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email 
            ? "Email already in use" 
            : "Username already taken"
        });
      }
    }

    // Update user with new data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update",
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    // Check if user is deleting their own account or is an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this user"
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required"
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
      error: error.message
    });
  }
};

// Verify JWT token
const verifyToken = async (req, res) => {
  try {
    // Token should be verified by auth middleware before reaching here
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message
    });
  }
};

// Update user location
const updateLocation = async (req, res) => {
  try {
    
    const { userId } = req.params;
    const { coordinates,locationName } = req.body;
    console.log("strytf",coordinates,locationName);

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid coordinates. Format: [longitude, latitude]" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: coordinates
        },
        place:locationName
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Location updated successfully",
      location: updatedUser.location,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating location", error: error.message });
  }
};

let passwordResetStorage = {};

// Clean up expired reset tokens
const cleanupResetTokens = () => {
  const now = Date.now();
  const expiryTime = 30 * 60 * 1000; // 30 minutes

  Object.keys(passwordResetStorage).forEach(email => {
    if (now - passwordResetStorage[email].timestamp > expiryTime) {
      delete passwordResetStorage[email];
    }
  });
};

// Initiate forgot password - send reset link via email
const forgotPassword = async (req, res) => {
  try {
    console.log("usttt",req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists (but don't reveal if email doesn't exist for security)
    const user = await User.findOne({ email });
    console.log("usr",user);
    
    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists in our system, a password reset link has been sent."
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token with expiration
    passwordResetStorage[email] = {
      token: resetToken,
      userId: user._id,
      timestamp: Date.now()
    };

    // Create reset link (adjust URL to match your frontend)
    const resetLink = `https://serchby.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send password reset email
    await sendMail.sendPasswordResetEmail(email, resetLink, user.username);
    
    console.log("Password reset link:", resetLink); // For development only
    console.log("Reset token:", resetToken); // For development only

    // Clean up expired tokens
    cleanupResetTokens();

    res.status(200).json({
      success: true,
      message: "If the email exists in our system, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
};

// Verify reset token validity
const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required"
      });
    }

    // Check if token exists and is valid
    const resetData = passwordResetStorage[email];
    if (!resetData || resetData.token !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check if token is expired (30 minutes)
    const now = Date.now();
    const expiryTime = 30 * 60 * 1000;
    if (now - resetData.timestamp > expiryTime) {
      delete passwordResetStorage[email];
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one."
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid"
    });

  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
      error: error.message
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    console.log("krr", req.body);
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required"
      });
    }

    // Validate password strength (add your own validation rules)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if token exists and is valid
    const resetData = passwordResetStorage[email];
    if (!resetData || resetData.token !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check if token is expired
    const now = Date.now();
    const expiryTime = 30 * 60 * 1000;
    if (now - resetData.timestamp > expiryTime) {
      delete passwordResetStorage[email];
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one."
      });
    }

    // Find user
    const user = await User.findById(resetData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Clean up reset token
    delete passwordResetStorage[email];

    // Send confirmation email
    await sendMail.sendPasswordResetConfirmation(email, user.username);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
      error: error.message
    });
  }
};


const updateUserContact = async (req, res) => {
  const { userId, phone, address } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Only update fields that are sent
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User contact info updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user contact info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  initiateRegistration,
  verifyOTPAndRegister ,
  resendOTP ,
  login,
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  verifyToken,
  updateLocation,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateUserContact
};