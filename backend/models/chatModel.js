const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["text", "image", "appointment"],
  
  },
  text: {
    type: String // Optional, used only if type === 'text'
  },
  image: {
    type: String // Optional, used only if type === 'image'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment" // Optional, if type === 'appointment'
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

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
