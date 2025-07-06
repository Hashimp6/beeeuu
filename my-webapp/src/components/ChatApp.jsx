import React, { useRef, useState } from 'react';
import ChatList from './ChatList';
import ChatScreen from './ChatScreen';

// Toast component for notifications
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-gray-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">×</button>
      </div>
    </div>
  );
};

const ChatAppScreen = ({ targetUser }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track the last processed user to prevent duplicate processing
  const lastProcessedUserRef = useRef(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleChatSelect = (chat, index) => {
    setSelectedChat(chat);
    setIsMobileView(true);
  };

  const handleBackPress = () => {
    setSelectedChat(null);
    setIsMobileView(false);
  };

  // Single function to handle direct chat opening
  const handleDirectChatOpen = async (user) => {
    console.log('handleDirectChatOpen called with:', user);
    
    // Prevent duplicate processing
    if (lastProcessedUserRef.current === user?._id) {
      console.log('User already processed, skipping...');
      return;
    }
    
    try {
      if (!user) {
        console.error('No user provided to handleDirectChatOpen');
        showToast('No user data provided', 'error');
        return;
      }

      // Mark this user as processed
      lastProcessedUserRef.current = user._id;

      const newChat = {
        name: user.username || user.storeName || user.name || 'New Chat',
        avatar: user.profileImage || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id || user.id}`,
        lastMessage: 'No messages yet',
        time: 'now',
        unread: 0,
        online: user.isOnline || false,
        isGroup: false,
        sender: null,
        otherUser: {
          _id: user._id || user.id,
          username: user.username || user.storeName || user.name,
          profileImage: user.profileImage || user.avatar,
          userId: user._id || user.id,
          storeName: user.storeName
        }
      };

      console.log('Created chat object:', newChat);
      console.log('otherUser data:', newChat.otherUser);

      setSelectedChat(newChat);
      setIsMobileView(true);
      setIsInitialized(true);
      showToast(`Opening chat with ${newChat.name}`, 'success');
    } catch (error) {
      console.error('Error opening direct chat:', error);
      showToast('Failed to open chat', 'error');
    }
  };

  // Single useEffect to handle targetUser - only runs once per user
  React.useEffect(() => {
    console.log('ChatAppScreen useEffect - targetUser:', targetUser);
    
    if (targetUser && !isInitialized) {
      // Only process if we haven't already processed this user
      if (lastProcessedUserRef.current !== targetUser._id) {
        handleDirectChatOpen(targetUser);
      }
    }
  }, [targetUser, isInitialized]); // Added isInitialized to dependencies

  // Reset when targetUser changes to a different user
  React.useEffect(() => {
    if (targetUser && lastProcessedUserRef.current !== targetUser._id) {
      setIsInitialized(false);
      setSelectedChat(null);
    }
  }, [targetUser?._id]);

  // Handle screen resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileView(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-100 overflow-hidden rounded-lg shadow-md">
      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        <div className="w-1/3 border-r border-gray-200">
          <ChatList 
            onChatSelect={handleChatSelect} 
            showToast={showToast}
            onDirectChat={handleDirectChatOpen}
          />
        </div>
        <div className="flex-1">
          {selectedChat ? (
            <ChatScreen
              selectedChat={selectedChat}
              onBackPress={handleBackPress}
              showToast={showToast}
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

      {/* Mobile Layout */}
      <div className="flex md:hidden w-full min-h-[calc(100vh-4rem)]">
        {!isMobileView ? (
          <div className="w-full min-h-[calc(100vh-4rem)]">
            <ChatList 
              onChatSelect={handleChatSelect} 
              showToast={showToast}
              onDirectChat={handleDirectChatOpen}
            />
          </div>
        ) : (
          <div className="w-full min-h-[calc(100vh-4rem)]">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
              <ChatScreen
                selectedChat={selectedChat}
                onBackPress={handleBackPress}
                showToast={showToast}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAppScreen;