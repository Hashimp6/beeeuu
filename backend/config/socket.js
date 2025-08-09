const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

let io;

/**
 * Initialize socket.io server with authentication and improved chat functionality
 * @param {Server} server - HTTP server instance
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Add ping timeout & interval for better connection stability
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware
  io.use(async (socket, next) => {
    try {
     
      // Accept token from either auth header or query param
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by decoded id
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user info to socket instance
      socket.user = user;

      next();
    } catch (error) {
     next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ New socket connection attempt');

    // Validate authenticated user
    if (!socket.user) {
      console.log('⚠️ Unauthorized socket — disconnecting...');
      return socket.disconnect(true);
    }

    const userId = socket.user._id.toString();
    console.log(`✅ Authenticated user connected: ${userId} (Socket ${socket.id})`);

    // Join user to their personal room for private messages
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined their personal room`);

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId) => {
      if (!conversationId) return;
      
      socket.join(`conversation:${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation ${conversationId}`);
      
      // Acknowledge join
      socket.emit('joined:conversation', {
        conversationId,
        status: 'success'
      });
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
      if (!conversationId) return;
      
      socket.leave(`conversation:${conversationId}`);
      console.log(`🚪 Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle message sending (direct client-to-client, not used by main API)
    socket.on('send:message', (data) => {
      const { conversationId, receiverId, message } = data;
      
      if (!conversationId || !message || !receiverId) {
        return socket.emit('error', {
          message: 'Missing required message data'
        });
      }
      
      console.log(`📨 Direct socket message from ${socket.user._id} to ${receiverId}`);

      // Add sender info to message
      const enrichedMessage = {
        ...message,
        sender: {
          _id: socket.user._id,
          username: socket.user.username
        },
        createdAt: new Date()
      };

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('new-message', {
        conversationId,
        message: enrichedMessage
      });
      
      // Also emit to receiver's personal room in case they're not in the conversation room
      io.to(`user:${receiverId}`).emit('new-message', {
        conversationId,
        message: enrichedMessage
      });
    });

    // Handle typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      
      // Broadcast to everyone in the conversation except sender
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId: socket.user._id,
        username: socket.user.username,
        conversationId,
        isTyping
      });
    });

    // Handle read receipts
    socket.on('message:read', ({ conversationId, messageIds }) => {
      if (!conversationId || !messageIds) return;
      
      socket.to(`conversation:${conversationId}`).emit('messages:read', {
        userId: socket.user._id,
        conversationId,
        messageIds
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for user ${socket.user._id}:`, error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user._id} (Socket ${socket.id}). Reason: ${reason}`);
    });
  });

  return io;
}

/**
 * Get the initialized io instance
 * @returns {Server} Socket.io server instance
 */
function getIo() {
  if (!io) {
    throw new Error("❌ Socket.io not initialized! Please call initializeSocket(server) first.");
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIo
};