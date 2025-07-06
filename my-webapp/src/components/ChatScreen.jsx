import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Paperclip, Smile, Mic, CheckCircle, AlertCircle, Clock, Phone, Video, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/UserContext';
import { SERVER_URL } from '../Config';
import ChatAppointmentCard from './user/ChatAppointmentCard';
import io from 'socket.io-client'; // Add socket.io-client import

// Message Component
const MessageBubble = ({ message, isOwnMessage, user }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (message) => {
    if (message.pending) {
      return <Clock size={14} className="text-gray-500" />;
    } else if (message.failed) {
      return <AlertCircle size={14} className="text-red-500" />;
    } else {
      return <CheckCircle size={14} className="text-gray-600" />;
    }
  };

  // Check if message is appointment type
  if (message.messageType === 'appointment') {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${message.pending ? 'opacity-70' : ''} ${message.failed ? 'border-2 border-red-500 rounded-lg' : ''}`}>
          <ChatAppointmentCard 
            appointmentData={message.appointmentData || message.data} 
            isOwnMessage={isOwnMessage}
          />
          <div className="flex items-center justify-between mt-1 px-2">
            <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
            {isOwnMessage && (
              <span className="ml-2">
                {getMessageStatus(message)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular text message
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-black text-white' 
          : 'bg-gray-200 text-gray-800'
      } ${message.pending ? 'opacity-70' : ''} ${message.failed ? 'border-2 border-red-500' : ''}`}>
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className="ml-2">
              {getMessageStatus(message)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatScreen = ({ selectedChat, onBackPress, showToast }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { token, user } = useAuth();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  const initializeSocket = () => {
    try {
      if (!token) return;
      
      const socketInstance = io(SERVER_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        showToast('Connection error. Messages may not be real-time.', 'error');
      });
      
      setSocket(socketInstance);
      
      return socketInstance;
      
    } catch (error) {
      console.error('Socket initialization error:', error);
      showToast('Failed to connect to real-time messaging', 'error');
    }
  };

  // Setup socket listeners for a conversation
  const setupSocketConnection = (chatId, socketInstance) => {
    if (!socketInstance || !chatId) return;
    
    // Clean up existing listeners
    socketInstance.off('new-message');
    
    // Join conversation room
    socketInstance.emit('join', { conversationId: chatId });
    
    // Listen for new messages
    socketInstance.on('new-message', (data) => {
      console.log('New message received:', data);
      
      if (data.conversationId === chatId) {
        const newMessage = {
          _id: data.message._id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: data.message.text,
          sender: data.message.sender,
          createdAt: data.message.createdAt,
          messageType: data.message.type || 'text',
          appointmentData: data.message.appointmentData || null,
        };
        
        setMessages(prevMessages => {
          const existingMessage = prevMessages.find(msg => 
            msg._id === newMessage._id || 
            (msg._id.startsWith('temp-') && msg.text === newMessage.text && msg.sender._id === newMessage.sender._id)
          );
          
          if (existingMessage) {
            return prevMessages.map(msg => 
              msg._id === existingMessage._id ? newMessage : msg
            );
          } else {
            return [...prevMessages, newMessage];
          }
        });
        
        setTimeout(scrollToBottom, 100);
      }
    });
  };

  // Initialize or create conversation
  const initializeChat = async (otherUser) => {
    console.log('initializeChat called with:', otherUser);
    
    try {
      setLoading(true);
      
      if (!otherUser || !token) {
        console.error('Missing data - otherUser:', otherUser, 'token:', !!token);
        showToast('Missing required information', 'error');
        return;
      }
      
      const receiverId = typeof otherUser === 'object' ? 
        (otherUser._id || otherUser.userId) : otherUser;
      
      console.log('Using receiverId:', receiverId);
      
      if (!receiverId) {
        console.error('No receiverId found');
        showToast('Invalid user information', 'error');
        return;
      }
      
      // Create a new conversation
      const response = await fetch(
        `${SERVER_URL}/messages/conversations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ receiverId }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const chatId = data.conversationId;
      
      if (!chatId) {
        throw new Error('No conversation ID received');
      }
      
      setConversationId(chatId);
      await fetchMessages(chatId);
      
      // Setup socket connection
      const socketInstance = socket || initializeSocket();
      if (socketInstance) {
        setupSocketConnection(chatId, socketInstance);
      }
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      showToast(error.message || 'Failed to load conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (chatId) => {
    if (!chatId || !token) return;
    
    try {
      const response = await fetch(
        `${SERVER_URL}/messages/conversations/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const messagesWithUniqueIds = (data.messages || []).map(msg => ({
        ...msg,
        _id: msg._id?.toString() || `msg-${Math.random().toString(36).substr(2, 9)}`,
        messageType: msg.type || msg.messageType || 'text'
      }));
      
      setMessages(messagesWithUniqueIds);
      setTimeout(scrollToBottom, 200);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast(error.message || 'Failed to load messages', 'error');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || sending || !conversationId || !selectedChat?.otherUser?._id) return;
    
    const messageText = message.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    try {
      setSending(true);
      setMessage('');
      
      // Add temporary message
      const tempMessage = {
        _id: tempId,
        text: messageText,
        sender: {
          _id: user._id,
          username: user.username,
        },
        createdAt: new Date().toISOString(),
        pending: true,
        messageType: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setTimeout(scrollToBottom, 50);
      
      // Send to server
      const response = await fetch(
        `${SERVER_URL}/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverId: selectedChat.otherUser._id,
            text: messageText,
            conversationId,
            messageType: 'text'
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Replace temp message with server response
      if (data.data) {
        const serverMessage = {
          ...data.data,
          _id: data.data._id.toString(),
          messageType: data.data.type || 'text'
        };
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? serverMessage : msg
          )
        );
        
        // Emit to socket if available
        if (socket && socketConnected) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      showToast(error.message || 'Failed to send message', 'error');
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? { ...msg, failed: true, pending: false } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Send appointment message
  const sendAppointmentMessage = async (messageText, appointmentData) => {
    if (!conversationId || !selectedChat?.otherUser?._id || sending) return;
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    try {
      setSending(true);
      
      // Add temporary message
      const tempMessage = {
        _id: tempId,
        text: messageText,
        sender: {
          _id: user._id,
          username: user.username,
        },
        createdAt: new Date().toISOString(),
        pending: true,
        messageType: 'appointment',
        appointmentData: appointmentData
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setTimeout(scrollToBottom, 50);
      
      // Send to server
      const response = await fetch(
        `${SERVER_URL}/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverId: selectedChat.otherUser._id,
            text: messageText,
            conversationId,
            messageType: 'appointment',
            appointmentData: appointmentData
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Replace temp message with server response
      if (data.data) {
        const serverMessage = {
          ...data.data,
          _id: data.data._id.toString(),
          messageType: data.data.type || 'appointment'
        };
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? serverMessage : msg
          )
        );
        
        // Emit to socket if available
        if (socket && socketConnected) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending appointment message:', error);
      showToast(error.message || 'Failed to send appointment', 'error');
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? { ...msg, failed: true, pending: false } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Initialize chat when component mounts or selectedChat changes
  useEffect(() => {
    if (selectedChat && token && user) {
      // Reset state for new chat
      setMessages([]);
      setConversationId(null);
      setLoading(false);
      
      // Initialize new chat
      initializeChat(selectedChat.otherUser);
    }
  }, [selectedChat?.id, token, user]);

  // Initialize socket on mount
  useEffect(() => {
    if (token && user) {
      initializeSocket();
    }
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, user]);

  // Clean up socket listeners when conversation changes
  useEffect(() => {
    return () => {
      if (socket && conversationId) {
        socket.emit('leave', { conversationId });
        socket.off('new-message');
      }
    };
  }, [conversationId]);

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackPress}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="relative">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedChat.online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
            <p className="text-sm text-gray-500">
              {socketConnected ? (selectedChat.online ? 'Online' : 'Offline') : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <p className="text-lg font-medium mb-2">Start your conversation</p>
              <p className="text-sm">Send a message to begin chatting with {selectedChat.name}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwnMessage={msg.sender._id === user?._id}
                user={user}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Paperclip size={18} className="text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button className="absolute right-2 top-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Smile size={16} className="text-gray-500" />
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Mic size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="p-3 bg-black rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;