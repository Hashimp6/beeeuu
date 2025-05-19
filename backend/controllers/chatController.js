const Conversation = require("../models/chatModel");
const User = require("../models/userModel");
const { getIo } = require("../config/socket");
const mongoose = require("mongoose");

/**
 * Improved Message Controller with consistent socket pattern
 */

// Send a message and store it in the database
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    // Validate if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Get or create conversation between these two users
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
        messages: [],
      });
    }

    // Add new message to conversation
    const newMessage = {
      sender: senderId,
      text,
      createdAt: new Date(),
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    // Get the message with its MongoDB-generated ID
    const savedMessage =
      conversation.messages[conversation.messages.length - 1];

    // Format message for socket emission
    const messageForSocket = {
      _id: savedMessage._id,
      sender: {
        _id: senderId,
        name: req.user.name,
      },
      text,
      createdAt: savedMessage.createdAt,
    };

    // Emit message through socket to specific rooms
    const io = getIo();

    // Emit to receiver's personal room
    io.to(`user:${receiverId}`).emit("new-message", {
      conversationId: conversation._id,
      message: messageForSocket,
    });

    // Also emit to conversation room if being used
    io.to(`conversation:${conversation._id}`).emit("new-message", {
      conversationId: conversation._id,
      message: messageForSocket,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageForSocket,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const userId = req.user.id;

    // Convert params to integers
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);
    const skip = (pageInt - 1) * limitInt;

    // Find conversation and verify user is a member
    const conversation = await Conversation.findById(conversationId)
      .populate("members", "username email")
      .populate("messages.sender", "username");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of this conversation
    if (
      !conversation.members.some((member) => member._id.toString() === userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this conversation",
      });
    }

    // Get paginated messages
    const totalMessages = conversation.messages.length;

    // Get slice of messages with pagination
    const messages = conversation.messages
      .slice(Math.max(0, totalMessages - skip - limitInt), totalMessages - skip)
      .sort((a, b) => a.createdAt - b.createdAt);

    res.status(200).json({
      success: true,
      conversationId,
      messages,
      pagination: {
        total: totalMessages,
        page: pageInt,
        limit: limitInt,
        pages: Math.ceil(totalMessages / limitInt),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message,
    });
  }
};

// Get all conversations for the current user
const getUserConversations = async (req, res) => {
  try {
    // Find all conversations where the current user is a member
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] }
    })
    .populate("members", "username") // Populate members with username field
    .sort({ updatedAt: -1 }); // Sort by most recent
    
    // Format conversations to include otherUser for the frontend
    const formattedConversations = conversations.map(conversation => {
      // Find the other user in the conversation (not the current user)
      const otherUser = conversation.members.find(
        member => member._id.toString() !== req.user.id
      );
      
      // Get the last message if it exists
      const lastMessage = conversation.messages.length > 0 
        ? conversation.messages[conversation.messages.length - 1] 
        : null;
      
      // Count unread messages (you'll need to implement this logic)
      const unreadCount = 0; // Replace with actual unread count logic
      
      return {
        conversationId: conversation._id,
        otherUser: otherUser || { username: "Unknown User" },
        lastMessage: lastMessage ? {
          content: lastMessage.text,
          sender: lastMessage.sender
        } : null,
        unreadCount,
        updatedAt: conversation.updatedAt || conversation._id.getTimestamp()
      };
    });
    
    res.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversationId: existingConversation._id,
      });
    }

    // Create new conversation
    const newConversation = new Conversation({
      members: [senderId, receiverId],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newConversation.save();

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversationId: newConversation._id,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversationMessages,
  getUserConversations,
  createConversation,
};
