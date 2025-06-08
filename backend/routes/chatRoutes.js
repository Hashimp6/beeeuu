const express = require("express");
const router = express.Router();
const messageController = require("../controllers/chatController");
const { protect, authenticateToken } = require("../middleware/auth");
const { uploadChatImage } = require("../config/multer");

// All routes require authentication
router.use(protect);

// Conversation routes
router.post("/conversations",authenticateToken,  messageController.createConversation);
router.get("/conversations",authenticateToken, messageController.getUserConversations);
router.get(
  "/conversations/:conversationId",
  messageController.getConversationMessages
);

// Message route
router.post("/send",authenticateToken, uploadChatImage.single("image"), messageController.sendMessage);

module.exports = router;
