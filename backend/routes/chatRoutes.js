const express = require("express");
const router = express.Router();
const messageController = require("../controllers/chatController");
const { protect, authenticateToken } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Conversation routes
router.post("/conversations",authenticateToken, messageController.createConversation);
router.get("/conversations",authenticateToken, messageController.getUserConversations);
router.get(
  "/conversations/:conversationId",
  messageController.getConversationMessages
);

// Message route
router.post("/send",authenticateToken, messageController.sendMessage);

module.exports = router;
