// Updated Mongoose schema with timestamps
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  text: { 
    type: String 
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const conversationSchema = new mongoose.Schema({
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  messages: [messageSchema]
}, { timestamps: true }); // Add timestamps (createdAt, updatedAt)

module.exports = mongoose.model("Conversation", conversationSchema);