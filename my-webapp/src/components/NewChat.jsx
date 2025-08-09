import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Plus, Clock, CheckCheck, AlertCircle, Smile, Paperclip, Camera, Mic, Store } from 'lucide-react';
import axios from 'axios';
import { SERVER_URL } from '../Config';
import { useAuth } from '../context/UserContext';
import ChatAppointmentCard from './user/ChatAppointmentCard';
import { useLocation, useNavigate } from 'react-router-dom';




// Mock socket context - replace with your actual socket context
const useSocket = () => ({
  socket: {
    emit: (event, data) => console.log('Socket emit:', event, data),
    on: (event, callback) => console.log('Socket on:', event),
    off: (event) => console.log('Socket off:', event)
  }
});

// Chat List Component
const ChatListScreen = ({ onChatSelect, onNewChat }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${SERVER_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
 
      setConversations(response.data.conversations);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      setRefreshing(false);
      alert("Failed to load conversations. Please try again.");
    }
  };

  const getOtherUser = (conversation) => {
    if (conversation.otherUser) {
      return conversation.otherUser;
    }
    
    if (conversation.members && Array.isArray(conversation.members)) {
      const otherUser = conversation.members.find(member => 
        member._id !== user?._id
      );
      return otherUser;
    }
    
    return null;
  };

  const handleChatPress = (conversation) => {
    const otherUser = getOtherUser(conversation);
    const conversationId = conversation.conversationId || conversation._id;
    
    if (otherUser && conversationId) {
      onChatSelect({
        conversationId,
        otherUser,
      });
    } else {
      console.error("Missing otherUser or conversationId:", { otherUser, conversationId });
      alert("Unable to open chat. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const renderConversationItem = (conversation) => {
    const otherUser = getOtherUser(conversation);
    const lastMessage = conversation.lastMessage || (conversation.messages && conversation.messages[conversation.messages.length - 1]);
    const updatedAt = conversation.updatedAt || conversation.createdAt;

    if (!otherUser) {
      return null;
    }

    const displayName = otherUser.storeName || otherUser.username || "Unknown User";
    const initials = displayName.substring(0, 2).toUpperCase();
    const hasProfileImage = !!otherUser.profileImage;
    const isStore = !!otherUser.storeName;

    return (
      <div
        key={conversation._id}
        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => handleChatPress(conversation)}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
          isStore ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-200'
        }`}>
          {hasProfileImage ? (
            <img 
              src={otherUser.profileImage}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className={`text-lg font-bold ${
              isStore ? 'text-green-600' : 'text-gray-600'
            }`}>
              {initials}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">
                {displayName}
              </span>
              {isStore && (
                <Store className="w-3 h-3 text-green-500" />
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatTime(updatedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {lastMessage && lastMessage.content ? 
              lastMessage.content : 
              lastMessage && lastMessage.text ?
                lastMessage.text :
                "Start a conversation"
            }
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
    <div className="border-b border-gray-200 p-4 flex items-center gap-4 bg-white shadow-sm">
  <button
    onClick={() => navigate('/home')}
    className="p-2 rounded-full hover:bg-gray-100 transition duration-200 text-gray-600"
  >
    <ArrowLeft className="w-5 h-5" />
  </button>
  <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
</div>


      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">
                Start chatting with someone new by pressing the button below
              </p>
            </div>
          </div>
        ) : (
          <div>
            {conversations.map(renderConversationItem)}
          </div>
        )}
      </div>

    </div>
  );
};

// Chat Detail Component
// Chat Detail Component - FIXED VERSION
// Chat Detail Component - FIXED VERSION
const ChatDetailScreen = ({ conversationData, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    
    const { socket } = useSocket();
    const { user, token } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
  
    const otherUser = conversationData?.otherUser || null;
  
    // Separate effect for initializing chat (runs once when component mounts)
    useEffect(() => {
      if (!otherUser || !user || !token) {
        alert("Missing required information to load chat");
        onBack();
        return;
      }
  
      const initializeChat = async () => {
        try {
          setLoading(true);
          
          let chatId = conversationData?.conversationId;
          
          if (!chatId) {
            const receiverId = typeof otherUser === 'object' ? 
              (otherUser._id || otherUser.userId) : otherUser;
            
            // Create new conversation
            const response = await axios.post(`${SERVER_URL}/messages/conversations`, {
              receiverId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            chatId = response.data.conversationId;
          }
          
          setConversationId(chatId);
          await fetchMessages(chatId);
        } catch (error) {
          console.error('Error initializing chat:', error);
          alert('Failed to load conversation');
          onBack();
        } finally {
          setLoading(false);
        }
      };
  
      initializeChat();
    }, [conversationData?.conversationId, otherUser?._id, user?._id, token]); // Only depend on essential identifiers
  
    // Separate effect for socket connection (runs when socket and conversationId are ready)
    useEffect(() => {
      if (!socket || !conversationId) return;
  
   
      // Join the conversation room
      socket.emit('join', { conversationId });
      
      // Set up message listener
      const handleNewMessage = (data) => {
       if (data.conversationId === conversationId) {
          const newMessage = {
            _id: data.message._id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            text: data.message.text,
            sender: data.message.sender,
            createdAt: data.message.createdAt,
            messageType: data.message.type || 'text',
            appointmentData: data.message.appointmentData || null,
            image: data.message.image || null
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
          
          scrollToBottom();
        }
      };
  
      // Add event listener
      socket.on('new-message', handleNewMessage);
      
      // Cleanup function
      return () => {
       socket.off('new-message', handleNewMessage);
        socket.emit('leave', { conversationId });
      };
    }, [socket, conversationId]); // Only depend on socket and conversationId
  
    const fetchMessages = async (chatId) => {
      if (!chatId || !token) return;
      
      try {
        const response = await axios.get(`${SERVER_URL}/messages/conversations/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
     
        setMessages(response.data.messages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        alert('Failed to load messages');
      }
    };
  
    const scrollToBottom = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
  
    const sendMessage = async () => {
      if (!inputText.trim() || sending || !otherUser?._id || !conversationId) return;
      
      const messageText = inputText.trim();
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      try {
        setSending(true);
        setInputText('');
        
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
        scrollToBottom();
        
        // Send message to server
        const response = await axios.post(
            `${SERVER_URL}/messages/send`,
            {
              receiverId: otherUser._id,
              text: messageText,
              conversationId,
              messageType: 'text'
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        
        const serverMessage = {
          ...tempMessage,
          _id: response.data._id,
          pending: false
        };
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? serverMessage : msg
          )
        );
        
        if (socket) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? { ...msg, failed: true, pending: false } : msg
          )
        );
      } finally {
        setSending(false);
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };
  
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    const renderMessageStatus = (item) => {
      if (item.pending) {
        return <Clock className="w-3 h-3 text-gray-500" />;
      } else if (item.failed) {
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      } else {
        return <CheckCheck className="w-3 h-3 text-gray-500" />;
      }
    };
  
    const renderMessage = (message) => {
      const isOwnMessage = message.sender._id === user?._id;
      
      // Check if it's an appointment message
      if (message.messageType === 'appointment' && message.appointmentData) {
        return (
          <div
            key={message._id}
            className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-sm lg:max-w-md ${message.pending ? 'opacity-70' : ''}`}>
              <ChatAppointmentCard 
                appointmentData={message.appointmentData} 
                isOwnMessage={isOwnMessage}
              />
              <div className="flex items-center justify-end mt-1 gap-1 px-2">
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
                {isOwnMessage && renderMessageStatus(message)}
              </div>
            </div>
          </div>
        );
      }
      
      // Regular text message
      return (
        <div
          key={message._id}
          className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              isOwnMessage
                ? 'bg-black text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
            } ${message.pending ? 'opacity-70' : ''} ${
              message.failed ? 'border border-red-500' : ''
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <div className="flex items-center justify-end mt-1 gap-1">
              <span className={`text-xs ${
                isOwnMessage ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {formatTime(message.createdAt)}
              </span>
              {isOwnMessage && renderMessageStatus(message)}
            </div>
          </div>
        </div>
      );
    };
  
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversation...</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col h-screen md:h-full bg-white"> {/* Use h-screen on mobile, h-full on desktop */}
        {/* Header */}
        <div className="bg-black text-white px-5 py-4 flex items-center shadow-md border-b border-white/10 flex-shrink-0">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition duration-200 mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* Profile Image or Initial */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-gray-800 to-gray-600 border-2 border-cyan-500 shadow-lg flex items-center justify-center mr-4">
            {otherUser?.profileImage ? (
              <img 
                src={otherUser.profileImage}
                alt={otherUser.storeName || otherUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-cyan-400 text-lg font-semibold">
                {otherUser?.storeName
                  ? otherUser.storeName.charAt(0).toUpperCase()
                  : otherUser?.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* User Info */}
          <div>
            <h3 className="text-lg font-bold tracking-wide text-white">
              {otherUser?.storeName || otherUser?.username}
            </h3>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0"> {/* Add min-h-0 */}
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0"> {/* Add flex-shrink-0 */}
          <div className="flex items-end gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Smile className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex items-end bg-gray-100 rounded-full px-3 py-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="flex-1 bg-transparent resize-none outline-none text-sm max-h-20"
                rows="1"
              />
              
              <button className="p-1 text-gray-500 hover:text-gray-700 ml-2">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || sending}
              className={`p-2 rounded-full ${
                inputText.trim() && !sending
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : inputText.trim() ? (
                <Send className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
// Store Chat Button Component
const StoreChatButton = ({ store, onChatClick }) => {
  const handleClick = () => {
    onChatClick(store);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chat with {store.storeName || store.username}
    </button>
  );
};

// Main Chat App Component
const ChatApp = () => {
    const { state } = useLocation();
    const [currentView, setCurrentView] = useState('list');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { user, token } = useAuth();
  
    // Run once on mount if state exists
    useEffect(() => {
      if (state?.store) {
        handleStoreChatClick(state.store);
      }
    }, [state]);
    const handleChatSelect = (conversationData) => {
      setSelectedConversation(conversationData);
      setCurrentView('detail');
    };
  
    const handleBackToList = () => {
      setCurrentView('list');
      setSelectedConversation(null);
    };
  
    const handleNewChat = () => {
      console.log('New chat clicked');
    };
  
    const handleStoreChatClick = async (store) => {
      try {
        const existingConversation = await findExistingConversation(store.userId);
        if (existingConversation) {
          handleChatSelect({
            conversationId: existingConversation.conversationId,
            otherUser: {
              _id: store.userId,
              username: store.username,
              storeName: store.storeName,
              profileImage: store.profileImage,
            },
          });
        } else {
          handleChatSelect({
            otherUser: {
              _id: store.userId,
              username: store.username,
              storeName: store.storeName,
              profileImage: store.profileImage,
            },
          });
        }
      } catch (error) {
        console.error('Error handling store chat:', error);
        alert('Failed to open chat. Please try again.');
      }
    };
  
    const findExistingConversation = async (userId) => {
      try {
        const response = await axios.get(`${SERVER_URL}/conversations/find/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        console.error('Error finding existing conversation:', error);
        return null;
      }
    };
  
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-lg">
        
        {/* Desktop layout */}
        <div className="hidden md:flex w-full">
          
          {/* Chat List Sidebar */}
          <div className="w-1/3 border-r border-gray-300 bg-white shadow-inner">
            <ChatListScreen onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
          </div>
    
          {/* Chat Detail Section */}
          <div className="flex-1 bg-white">
            {selectedConversation ? (
              <ChatDetailScreen
                conversationData={selectedConversation}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a chat</h2>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
    
        {/* Mobile layout */}
        <div className="flex md:hidden w-full">
          {currentView === 'list' ? (
            <div className="w-full">
              <ChatListScreen onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
            </div>
          ) : (
            <div className="w-full">
              <ChatDetailScreen
                conversationData={selectedConversation}
                onBack={handleBackToList}
              />
            </div>
          )}
        </div>
      </div>
    );
    
  };
  

export default ChatApp;