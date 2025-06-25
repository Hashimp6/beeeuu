const Conversation = require("../models/chatModel");
const User = require("../models/userModel");
const { getIo } = require("../config/socket");
const mongoose = require("mongoose");
const storeModel = require("../models/storeModel");
const Appointment = require("../models/AppointmentModel");
const { sendChatNotification } = require("../services/notificationService");



const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, appointmentData } = req.body;
    console.log("dtasdad",req.body,"recieverId",receiverId);
    
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
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

    // Get or create conversation
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
        messages: [],
      });
    }

    // Build newMessage object
    let newMessage = {
      sender: senderId,
      createdAt: new Date(),
    };

    // 📝 TEXT
    if (text) {
      newMessage.type = "text";
      newMessage.text = text;
    }

    // 🖼️ IMAGE (from Multer - req.file.path contains Cloudinary URL)
    else if (req.file) {
      newMessage.type = "image";
      newMessage.image = req.file.path;
    }

    // 📅 APPOINTMENT (Save in appointment model and reference here)
    else if (appointmentData) {
      const parsedData = JSON.parse(appointmentData);
      
      const appointment = await Appointment.create({
        ...parsedData,
        user: senderId,
        store: parsedData.store, 
      });
    
      newMessage.type = "appointment";
      newMessage.appointment = appointment._id;
    }
    
    else {
      return res.status(400).json({
        success: false,
        message: "You must send either text, image, or appointment",
      });
    }

    // Save and emit
    conversation.messages.push(newMessage);
    await conversation.save();

    const savedMessage = conversation.messages[conversation.messages.length - 1];
// Send push notification to receiver
const receiverUser = await User.findById(receiverId);
if (receiverUser && receiverUser.pushToken) {
  const senderUser = await User.findById(senderId);
  const notificationText = newMessage.type === 'text'
    ? newMessage.text
    : newMessage.type === 'image'
    ? '📷 Sent an image'
    : '📅 Sent an appointment';

  await sendChatNotification(
    receiverUser.pushToken,
    senderUser.name || senderUser.username,
    notificationText,
    conversation._id.toString()
  );
}

    const messageForSocket = {
      _id: savedMessage._id,
      sender: { _id: senderId, name: req.user.name },
      type: newMessage.type,
      text: newMessage.text || null,
      image: newMessage.image || null,
      appointment: newMessage.appointment || null,
      createdAt: savedMessage.createdAt,
    };

    const io = getIo();
    io.to(`user:${receiverId}`).emit("new-message", {
      conversationId: conversation._id,
      message: messageForSocket,
    });

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
// Get messages for a specific conversation (UPDATED)
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
      .populate("messages.sender", "username")
      .populate({
        path: "messages.appointment",
        populate: [
          { 
            path: "user", 
            select: "username email",
            model: 'User' // Be explicit about the model
          },
          { 
            path: "store", 
            select: "storeName _id",
            model: 'Store' // Be explicit about the model
          },
          { 
            path: "product", 
            select: "name price",
            model: 'Product' // Be explicit about the model
          }
        ]
      });
      console.log('Full conversation:', JSON.stringify(conversation, null, 2));

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

    // Format messages for frontend
    const formattedMessages = messages.map(message => {
      const baseMessage = {
        _id: message._id,
        sender: message.sender,
        createdAt: message.createdAt,
        messageType: message.type || 'text', // Map 'type' to 'messageType' for frontend
        read: message.read
      };

      // Add content based on message type
      switch (message.type) {
        case 'text':
          baseMessage.text = message.text;
          break;
        case 'image':
          baseMessage.image = message.image;
          break;
        case 'appointment':
          baseMessage.appointmentData = message.appointment ? {
            _id: message.appointment._id,
            productName: message.appointment.productName,
            status: message.appointment.status,
            payment: message.appointment.payment,
            cost: message.appointment.cost,
            amountPaid: message.appointment.amountPaid,
            date: message.appointment.date,
            address: message.appointment.address,
            locationName: message.appointment.locationName,
            contactNo: message.appointment.contactNo,
            user: message.appointment.user,
            store: message.appointment.store,
            product: message.appointment.product
          } : null;
          // Also add a text description for the appointment
          baseMessage.text = `Appointment scheduled for ${message.appointment?.productName || 'service'}`;
          break;
        default:
          baseMessage.text = message.text || '';
      }

      return baseMessage;
    });

    res.status(200).json({
      success: true,
      conversationId,
      messages: formattedMessages,
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
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] }
    })
    .populate({
      path: "members",
      select: "username storeId",
      populate: {
        path: "storeId",
        select: "storeName profileImage"
      }
    })
    .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(conversation => {
      const otherUser = conversation.members.find(
        member => member._id.toString() !== req.user.id
      );

      const lastMessage = conversation.messages.length > 0 
        ? conversation.messages[conversation.messages.length - 1] 
        : null;

      const unreadCount = 0; // You can update this logic later

      return {
        conversationId: conversation._id,
        otherUser: {
          _id: otherUser?._id,
          username: otherUser?.username || "Unknown User",
          storeName: otherUser?.storeId?.storeName || null,
          profileImage: otherUser?.storeId?.profileImage || null
        },
        lastMessage: lastMessage ? {
          content: lastMessage.text || lastMessage.image || "Appointment",
          sender: lastMessage.sender
        } : null,
        unreadCount,
        updatedAt: conversation.updatedAt || conversation._id.getTimestamp()
      };
    });
console.log("listss are ",formattedConversations);

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
console.log("drr",senderId,receiverId);

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
