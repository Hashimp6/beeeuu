import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Store Header Component - Improved with cleaner styling
const StoreHeader = ({ storeData }) => {
  console.log("strdttd",storeData);
  
  if (!storeData) return null;
  
  return (
    <View style={storeHeaderStyles.container}>
      {/* Store Image */}
      {storeData.profileImage? (
        <Image 
          source={{ uri: storeData.profileImage }} 
          style={storeHeaderStyles.storeImage} 
          resizeMode="cover"
        />
      ) : (
        <View style={storeHeaderStyles.storeImagePlaceholder}>
          <Text style={storeHeaderStyles.storeImagePlaceholderText}>
            {storeData.storeName ? storeData.storeName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
      )}

      {/* Store Details */}
      <View style={storeHeaderStyles.storeInfoContainer}>
        <Text style={storeHeaderStyles.storeLabel}>STORE</Text>
        <Text style={storeHeaderStyles.storeName}>
          {storeData.storeName || 'Store'}
        </Text>
        {storeData.description && (
          <Text style={storeHeaderStyles.storeDescription} numberOfLines={2}>
            {storeData.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const ChatDetailScreen = ({ navigation, route }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);
  
  // Get parameters and auth context
  const { conversationId, otherUser } = route.params || {};
  const { user, token } = useAuth() || {};
  
  const flatListRef = useRef(null);
  
  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!messages.length) return [];
    
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    // Convert to array format for FlatList
    return Object.keys(groups).map(date => ({
      date,
      data: groups[date],
      id: date,
    }));
  }, [messages]);
  
  // Setup navigation header and fetch data
  useEffect(() => {
    // Validate required data
    if (!conversationId || !otherUser || !user || !token) {
      Alert.alert(
        "Error",
        "Missing required information to load chat",
        [{ text: "Go Back", onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    // If it's a store, fetch additional store details
    // if (otherUser._id) {
    //   fetchStoreDetails();
    // }
    
    // Set up header
    configureHeader();
    
    // Fetch messages on component mount
    fetchMessages();
    
    // Setup socket connection
    setupSocketConnection();
    
    return () => {
      // Clean up socket listeners
      if (socket) {
        socket.off('new-message');
        socket.emit('leave', { conversationId });
      }
    };
  }, [conversationId, otherUser, user, token, socket]);
  
  // Setup custom header configuration
  const configureHeader = () => {
    navigation.setOptions({
      // Use a simple title to avoid the complex header component issues
      headerTitle: otherUser?.storeName || otherUser?.username || 'Chat',
      headerTitleStyle: styles.headerTitleText,
      headerStyle: {
        backgroundColor: '#000000',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#FFFFFF',
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  };
  
  // Setup socket connection and listeners
  const setupSocketConnection = () => {
    if (!socket || !conversationId) return;
    
    // Join conversation room
    socket.emit('join', { conversationId: conversationId });
    
    // Listen for new messages
    socket.on('new-message', (data) => {
      // Only update if it's for our conversation
      if (data.conversationId === conversationId) {
        const newMessage = {
          _id: data.message._id,
          text: data.message.text,
          sender: data.message.sender,
          createdAt: data.message.createdAt
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }
    });
  };
  
  // Fetch store details if available
  // const fetchStoreDetails = async () => {
  //   try {
     
      
  //     const response = await axios.get(
  //       `${SERVER_URL}/stores/${otherUser._id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("ggg",response.data.store);
      
  //     if (response.data && response.data.store) {
  //       setStoreDetails(response.data.store);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching store details:', error);
  //     // Continue without store details
  //   }
  // };
  
  // Fetch messages from API
  const fetchMessages = async () => {
    if (!conversationId || !token) return;
    
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${SERVER_URL}/messages/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Ensure unique IDs for all messages
      const messagesWithUniqueIds = (response.data.messages || []).map(msg => ({
        ...msg,
        _id: msg._id?.toString() || `msg-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setMessages(messagesWithUniqueIds);
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  
  // Send message function
  const sendMessage = async () => {
    if (!inputText.trim() || sending || !otherUser?._id) return;
    
    try {
      setSending(true);
      const messageText = inputText.trim();
      setInputText(''); // Clear input immediately
      
      // Add temporary message to the list for immediate feedback
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const tempMessage = {
        _id: tempId,
        text: messageText,
        sender: {
          _id: user._id,
          username: user.username,
        },
        createdAt: new Date().toISOString(),
        pending: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
      
      // Send to server
      const response = await axios.post(
        `${SERVER_URL}/messages/send`,
        {
          receiverId: otherUser._id,
          text: messageText,
          conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Replace temp message with actual message from server
      if (response.data.data) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? { ...response.data.data, _id: response.data.data._id.toString() } : msg
          )
        );
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === `temp-${Date.now()}` ? { ...msg, failed: true } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp for messages
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for the message grouping
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Message status indicator
  const renderMessageStatus = (item) => {
    if (item.pending) {
      return <Ionicons name="time-outline" size={14} color="#757575" />;
    } else if (item.failed) {
      return <Ionicons name="alert-circle" size={14} color="#FF3B30" />;
    } else {
      return <Ionicons name="checkmark-done" size={14} color="#757575" />;
    }
  };
  
  // Render message component
  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender._id === user?._id;
    
    return (
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        item.pending && styles.pendingMessage,
        item.failed && styles.failedMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(item.createdAt)}
          </Text>
          {isOwnMessage && renderMessageStatus(item)}
        </View>
      </View>
    );
  };
  
  // Render date separator
  const renderDateSeparator = (date) => {
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateSeparatorText}>
          {formatDate(date)}
        </Text>
      </View>
    );
  };
  
  // Render list header with chat info
  const renderListHeader = () => {
    return (
      <View style={styles.listHeader}>
        {/* Enhanced Store Header when applicable */}
        {otherUser?.storeId && (
          <StoreHeader storeData={{
            ...otherUser,
            ...storeDetails
          }} />
        )}
        
        {/* User info display if not a store */}
        {!otherUser?.storeId && (
          <View style={styles.userInfoHeader}>
            {otherUser?.avatar ? (
              <Image 
                source={{ uri: otherUser.avatar }} 
                style={styles.userHeaderImage} 
              />
            ) : (
              <View style={styles.userHeaderImagePlaceholder}>
                <Text style={styles.userHeaderImageText}>
                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text style={styles.userHeaderName}>
              {otherUser?.username || 'User'}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // If missing required data, show loading screen
  if (!conversationId || !otherUser || !user || !token) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Chat background */}
        <View style={styles.wallpaper} />
        
        {/* Messages list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.messagesList}
            onRefresh={fetchMessages}
            refreshing={loading}
            ListHeaderComponent={renderListHeader}
            
            // Only uncomment this if you implement the grouped messages version
            // data={groupedMessages}
            // keyExtractor={(item) => item.id}
            // renderItem={({ item }) => (
            //   <>
            //     {renderDateSeparator(item.date)}
            //     {item.data.map(message => renderMessage({ item: message }))}
            //   </>
            // )}
          />
        )}
        
        {/* Input area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.inputIconButton}>
                <Ionicons name="happy-outline" size={24} color="#757575" />
              </TouchableOpacity>
              
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Message"
                  placeholderTextColor="#757575"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="attach" size={22} color="#757575" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cameraButton}>
                  <Ionicons name="camera" size={22} color="#757575" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonInactive
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : inputText.trim() ? (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                ) : (
                  <Ionicons name="mic" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

// Styles for the StoreHeader component
const storeHeaderStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  storeImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  storeInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  storeLabel: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 13,
    color: '#666666',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000', // Top status bar area
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F5', // Light gray background for the chat
  },
  headerBackButton: {
    marginLeft: 8,
    padding: 8,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  listHeader: {
    paddingTop: 12,
    paddingBottom: 16,
    // paddingHorizontal: 16,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeaderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userHeaderImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userHeaderImageText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  messagesList: {
    // paddingHorizontal: 16,
    // paddingBottom: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000', // Black for own messages
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White with border for other messages
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.8,
  },
  failedMessage: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF', // White text for own messages
  },
  otherMessageText: {
    color: '#000000', // Black text for other messages
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.7)', // Light color for timestamps in own messages
  },
  otherTimestamp: {
    color: '#757575', // Gray for timestamps in other messages
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconButton: {
    marginRight: 8,
    padding: 4,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#000000',
    paddingVertical: 8,
  },
  attachButton: {
    padding: 6,
    marginHorizontal: 2,
    transform: [{ rotate: '315deg' }]
  },
  cameraButton: {
    padding: 6,
    marginHorizontal: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000', // Black send button
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonInactive: {
    backgroundColor: '#333333', // Darker gray for inactive state
  }
});

export default ChatDetailScreen;