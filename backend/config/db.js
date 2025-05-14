const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");
    
    await mongoose.connect(process.env.MONGO_URI, {
    
    });
    
    console.log("MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Don't exit the process, just return false
    // process.exit(1); - remove this line
    return false;
  }
};

module.exports = connectDB;