import React, { forwardRef, useEffect, useState } from 'react';
import { Search, MessageCircle, Plus, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/UserContext';
import { SERVER_URL } from '../Config';

const ChatList = ({ onChatSelect, showToast, onDirectChat }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();


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
        online: Math.random() > 0.7, // Random online status for demo
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
  const handleDirectChat = async (targetUser) => {
    if (!token) {
      showToast('Authentication required', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Check if conversation already exists
      const existingChat = conversations.find(conv => 
        conv.otherUser?._id === targetUser._id || 
        conv.otherUser?.userId === targetUser._id
      );

      if (existingChat) {
        // If conversation exists, select it
        onChatSelect(existingChat, 0);
        showToast(`Opened existing chat with ${existingChat.name}`, 'success');
      } else {
        // Create new chat object for the target user
        const newChat = {
          id: targetUser._id || Date.now(),
          name: targetUser.username || targetUser.storeName || 'New Chat',
          avatar: targetUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser._id}`,
          lastMessage: 'No messages yet',
          time: 'now',
          unread: 0,
          online: Math.random() > 0.7,
          isGroup: false,
          sender: null,
          otherUser: targetUser
        };

        // Select this new chat
        onChatSelect(newChat, 0);
        showToast(`Started new conversation with ${newChat.name}`, 'success');
      }
    } catch (error) {
      console.error('Error opening direct chat:', error);
      showToast('Failed to open chat', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Call onDirectChat when it's passed as a prop
  React.useEffect(() => {
    if (onDirectChat) {
      // This allows parent to trigger direct chat
      window.openDirectChat = handleDirectChat;
    }
    
    return () => {
      if (window.openDirectChat) {
        delete window.openDirectChat;
      }
    };
  }, [onDirectChat, conversations, token]);


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

  const handleRefresh = () => {
    setRefreshing(true);
    showToast('Refreshing conversations...', 'info');
    fetchConversations();
  };

  const handleChatSelect = (chat, index) => {
    onChatSelect(chat, index);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                </p>
                <p className="text-sm">
                  {searchTerm ? 'Try searching with different keywords' : 'Start a new chat to get connected!'}
                </p>
              </div>
            ) : (
              filteredConversations.map((chat, index) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat, index)}
                  className="p-4 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                      />
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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
  );
};
export default ChatList;

