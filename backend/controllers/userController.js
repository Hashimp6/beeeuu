const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

/**
 * User Controller - Handles all user related operations
 */

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check for required fields
    if ( !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: " email, and password are required" 
      });
    }

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({ email });

    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (excluding password)
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
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
    const { coordinates } = req.body;
    console.log("strytf",coordinates);

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid coordinates. Format: [longitude, latitude]" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: coordinates,
        },
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


module.exports = {
  register,
  login,
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  verifyToken,
  updateLocation
};