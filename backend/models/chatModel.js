const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text:      { type: String },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // [user1, user2]
  messages: [messageSchema]
});

module.exports = mongoose.model("Conversation", conversationSchema);
