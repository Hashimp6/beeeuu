const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

/**
 * Authentication middleware for protecting routes
 */

// Middleware to verify JWT token and add user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route"
      });
    }

    try {
      console.log("Received token:", token,process.env.JWT_SECRET);
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("lllss",decoded);
      // Add user from payload to request
      req.user = await User.findById(decoded.id).select("-password");
      console.log("lll",req.user);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists"
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication"
    });
  }
};

// Middleware to restrict access by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;  // << attach decoded user info here
    next();
  });
};

module.exports = { protect, authorize,authenticateToken };