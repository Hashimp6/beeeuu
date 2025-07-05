import React, { useEffect, useState, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Smile, Paperclip, Mic, Users, Settings, MessageCircle, Plus, X, CheckCircle, AlertCircle, Info, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/UserContext';
import { SERVER_URL } from '../Config';
import ChatAppointmentCard from './user/ChatAppointmentCard';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gray-800 text-white';
      case 'error':
        return 'bg-black text-white';
      case 'info':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <MessageCircle size={20} />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${getToastStyles()} animate-slide-in`}>
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-75 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};

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
          <ChatAppointmentCard 
            appointmentData={message.appointmentData || message.data} 
            isOwnMessage={isOwnMessage}
          />
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

// Welcome Screen Component
const WelcomeScreen = () => {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MessageCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}!</h1>
          <p className="text-lg text-gray-600 mb-6">Welcome to your conversations</p>
        </div>
        
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Users size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Connect with others</h3>
              <p className="text-sm text-gray-500">Start meaningful conversations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Real-time messaging</h3>
              <p className="text-sm text-gray-500">Stay connected instantly</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <Settings size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage your chats</h3>
              <p className="text-sm text-gray-500">Organize your conversations</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

const ChatApp = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [socket, setSocket] = useState(null);
  const { token, user } = useAuth();
  const messagesEndRef = useRef(null);

  // Toast utility function
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  const initializeSocket = () => {
    try {
      // In a real app, you would initialize your socket here
      // For now, we'll simulate it
      console.log('Socket initialized');
      showToast('Connected to real-time messaging', 'success');
    } catch (error) {
      console.error('Socket connection error:', error);
      showToast('Failed to connect to real-time messaging', 'error');
    }
  };

  // Setup socket listeners for a conversation
  const setupSocketConnection = (chatId) => {
    if (!socket || !chatId) return;
    
    // Join conversation room
    socket.emit('join', { conversationId: chatId });
    
    // Listen for new messages
    socket.on('new-message', (data) => {
      if (data.conversationId === chatId) {
        const newMessage = {
          _id: data.message._id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: data.message.text,
          sender: data.message.sender,
          createdAt: data.message.createdAt,
          messageType: data.message.type || 'text',
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

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) {
      showToast('Authentication required', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${SERVER_URL}/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const conversationsData = data.conversations || data;
      
      const formattedConversations = conversationsData.map((conv, index) => ({
        id: conv.conversationId || index,
        name: conv.otherUser?.username || conv.otherUser?.storeName || 'Unknown User',
        avatar: conv.otherUser?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.conversationId || index}`,
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        time: formatTime(conv.updatedAt),
        unread: conv.unreadCount || 0,
        online: false,
        isGroup: false,
        sender: conv.lastMessage?.sender,
        otherUser: conv.otherUser
      }));
      
      setConversations(formattedConversations);
      setLoading(false);
      setRefreshing(false);
      
      if (formattedConversations.length > 0) {
        showToast(`Loaded ${formattedConversations.length} conversations`, 'success');
      } else {
        showToast('No conversations found', 'info');
      }
      
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      setRefreshing(false);
      showToast('Failed to load conversations. Please try again.', 'error');
    }
  };

  // Initialize or create conversation
  const initializeChat = async (otherUser) => {
    try {
      setLoading(true);
      
      const receiverId = typeof otherUser === 'object' ? 
        (otherUser._id || otherUser.userId) : otherUser;
      
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const chatId = data.conversationId;
      
      setConversationId(chatId);
      await fetchMessages(chatId);
      setupSocketConnection(chatId);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      showToast('Failed to load conversation', 'error');
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const messagesWithUniqueIds = (data.messages || []).map(msg => ({
        ...msg,
        _id: msg._id?.toString() || `msg-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setMessages(messagesWithUniqueIds);
      setTimeout(scrollToBottom, 200);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to load messages', 'error');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || sending || !conversationId) return;
    
    try {
      setSending(true);
      const messageText = message.trim();
      setMessage('');
      
      // Add temporary message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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
            receiverId: conversations[selectedChat]?.otherUser?._id,
            text: messageText,
            conversationId,
            messageType: 'text'
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        if (socket) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id.startsWith('temp-') ? { ...msg, failed: true, pending: false } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (token) {
      fetchConversations();
      initializeSocket();
    }
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    showToast('Refreshing conversations...', 'info');
    fetchConversations();
  };

  const handleChatSelect = async (index) => {
    setSelectedChat(index);
    const chat = conversations[index];
    showToast(`Opening chat with ${chat.name}`, 'info');
    
    // Initialize chat if we don't have conversationId
    if (!conversationId || conversationId !== chat.id) {
      await initializeChat(chat.otherUser);
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

  return (
    <div className="flex h-full bg-white text-gray-900 relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={loading || refreshing}
              >
                <MessageCircle size={20} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => showToast('New chat feature coming soon!', 'info')}
              >
                <Plus size={20} className="text-gray-600" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => showToast('Settings panel coming soon!', 'info')}
              >
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
              Loading conversations...
            </div>
          ) : (
            <>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Start a new chat to get connected!</p>
                </div>
              ) : (
                conversations.map((chat, index) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(index)}
                    className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                      selectedChat === index
                        ? 'bg-gray-100 border-gray-600'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                        />
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate flex items-center text-gray-900">
                            {chat.name}
                            {chat.isGroup && <Users size={14} className="ml-1 text-gray-400" />}
                          </p>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="bg-gray-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChat === null ? (
        <WelcomeScreen />
      ) : (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={conversations[selectedChat].avatar}
                  alt={conversations[selectedChat].name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {conversations[selectedChat].online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{conversations[selectedChat].name}</h2>
                <p className="text-sm text-gray-500">
                  {conversations[selectedChat].online ? 'Online' : 'Last seen 2h ago'}
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
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Start your conversation</p>
                  <p className="text-sm">Send a message to begin chatting with {conversations[selectedChat].name}</p>
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
                  onChange={(e) => setMessage(e.target.value)}
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
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatApp;