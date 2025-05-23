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


const ChatDetailScreen = ({ navigation, route }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [pendingAppointment, setPendingAppointment] = useState(null);
  
  // Get parameters and auth context
  const otherUser = route.params?.otherUser || null;
  const { user, token } = useAuth() || {};
  
  const flatListRef = useRef(null);
  
  
  // Setup navigation header and fetch data
  useEffect(() => {
    console.log("other derais",otherUser);
    
    // Validate required data
    if (!otherUser || !user || !token) {
      Alert.alert(
        "Error",
        "Missing required information to load chat",
        [{ text: "Go Back", onPress: () => navigation.goBack() }]
      );
      return;
    }
    
   
    
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Check if conversationId was passed or create a new conversation
        let chatId = route.params?.conversationId;
        
        if (!chatId) {
          const receiverId = typeof otherUser === 'object' ? 
            (otherUser._id || otherUser.userId) : otherUser;
          
          console.log('Creating conversation with receiverId:', receiverId);
          
          // Create a new conversation
          const response = await axios.post(
            `${SERVER_URL}/messages/conversations`,
            { receiverId },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log("response", response.data);
          
          chatId = response.data.conversationId;
        }
        
        // Set conversation ID in state
        setConversationId(chatId);
        
        // Now fetch messages with the conversation ID
        await fetchMessages(chatId);
        
        // Setup socket connection
        setupSocketConnection(chatId);
      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Failed to load conversation');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
    
    return () => {
      // Clean up socket listeners
      if (socket && conversationId) {
        socket.off('new-message');
        socket.off('message-sent'); // Also clean up any other listeners
        socket.emit('leave', { conversationId });
      }
    };
  }, [otherUser, user, token, socket, conversationId]); 

  // Listen for navigation focus events to handle appointment messages
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.appointmentMessage && route.params?.appointmentData) {
        console.log('Navigation focus - setting pending appointment', {
          message: route.params.appointmentMessage,
          data: route.params.appointmentData
        });
        
        setPendingAppointment({
          message: route.params.appointmentMessage,
          data: route.params.appointmentData,
        });

        // Clear the route params to prevent duplicate messages
        navigation.setParams({ 
          appointmentMessage: null, 
          appointmentData: null 
        });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  // Process pending appointment once we have a conversation ID
  useEffect(() => {
    if (pendingAppointment && conversationId) {
      console.log('Processing pending appointment with conversation ID:', conversationId);
      sendAppointmentMessage(pendingAppointment.message, pendingAppointment.data);
      setPendingAppointment(null); // Clear after sending
    }
  }, [pendingAppointment, conversationId]);

  // Handle sending appointment messages
  const sendAppointmentMessage = async (messageText, appointmentData) => {
    console.log("Sending appointment message:", messageText);
    console.log("Appointment data:", appointmentData);
    console.log("Conversation ID:", conversationId);
    
    if (!messageText || !conversationId) {
      console.error("Missing required data for appointment message");
      return;
    }
    
    try {
      setSending(true);
      
      // Create a simplified appointment data object to ensure consistent serialization
      const simplifiedAppointmentData = {
        date: appointmentData.date,
        time: appointmentData.time,
        status: appointmentData.status || 'Pending',
        storeId: typeof appointmentData.storeId === 'object' ? 
          appointmentData.storeId._id : appointmentData.storeId
      };
      
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
        pending: true,
        messageType: 'appointment',
        appointmentData: simplifiedAppointmentData
      };
      
      // Set the message immediately
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
          messageType: 'appointment',
          appointmentData: simplifiedAppointmentData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log('Appointment message response:', response.data);
      
      // Replace temp message with actual message from server
      if (response.data.data) {
        const serverMessage = {
          ...response.data.data,
          _id: response.data.data._id.toString(),
          messageType: 'appointment',
          appointmentData: simplifiedAppointmentData
        };
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? serverMessage : msg
          )
        );
        
        // Also emit to socket for real-time update to other user
        if (socket) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending appointment message:', error.response || error);
      Alert.alert('Error', 'Failed to send appointment message');
      
      // Mark message as failed and don't remove it
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? { ...msg, failed: true, pending: false } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };
  
  

  // Setup socket connection and listeners
  const setupSocketConnection = (chatId) => {
    if (!socket || !chatId) return;
    
    // Join conversation room
    socket.emit('join', { conversationId: chatId });
    
    // Listen for new messages
    socket.on('new-message', (data) => {
      console.log('Raw socket data received:', data);
      
      // Only update if it's for our conversation
      if (data.conversationId === chatId) {
        const newMessage = {
          _id: data.message._id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: data.message.text,
          sender: data.message.sender,
          createdAt: data.message.createdAt,
          messageType: data.message.messageType || 'text', // Default to 'text' if not specified
          appointmentData: data.message.appointmentData || null
        };
        
        console.log('Processed new message:', newMessage);
        
        // Check if this message already exists (to prevent duplicates)
        setMessages(prevMessages => {
          const existingMessage = prevMessages.find(msg => 
            msg._id === newMessage._id || 
            (msg._id.startsWith('temp-') && msg.text === newMessage.text && msg.sender._id === newMessage.sender._id)
          );
          
          if (existingMessage) {
            // Replace temp message or update existing
            return prevMessages.map(msg => 
              msg._id === existingMessage._id ? newMessage : msg
            );
          } else {
            // Add new message
            return [...prevMessages, newMessage];
          }
        });
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }
    });
  };
  
  
  // Fetch messages from API
  const fetchMessages = async (chatId) => {
    if (!chatId || !token) return;
    
    try {
      const response = await axios.get(
        `${SERVER_URL}/messages/conversations/${chatId}`,
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
    }
  };
  
  // Send regular message function
  const sendMessage = async () => {
    if (!inputText.trim() || sending || !otherUser?._id || !conversationId) return;
    
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
        pending: true,
        messageType: 'text'
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
          messageType: 'text'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Replace temp message with actual message from server
      if (response.data.data) {
        const serverMessage = {
          ...response.data.data,
          _id: response.data.data._id.toString(),
          messageType: 'text'
        };
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? serverMessage : msg
          )
        );
        
        // Also emit to socket for real-time update
        if (socket) {
          socket.emit('send-message', {
            conversationId,
            message: serverMessage
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
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
  
  // Format timestamp for messages
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for the message grouping

  
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
    
    // Special handling for appointment messages
    const isAppointmentMessage = item.messageType === 'appointment';
    
    // For appointment messages, use the AppointmentCard component
    if (isAppointmentMessage && item.appointmentData) {
      return (
        <View style={[
          isOwnMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
          item.pending && { opacity: 0.7 },
          item.failed && { borderWidth: 1, borderColor: '#FF3B30', borderRadius: 12 },
          { marginVertical: 4, maxWidth: '80%' }
        ]}>
          <AppointmentCard 
            date={item.appointmentData.date}
            time={item.appointmentData.time}
          />
          
          <View style={[
            styles.messageFooter,
            { paddingHorizontal: 8, marginTop: 2 }
          ]}>
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
    }
    
    // For regular messages, use the existing bubble style
    return (
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        item.pending && styles.pendingMessage,
        item.failed && styles.failedMessage,
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
      <View style={styles.header}>
      {otherUser.avatar? (
        <Image 
          source={{ uri: otherUser.avatar }} 
          style={styles.avatar} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.storeImagePlaceholder}>
          <Text style={styles.storeImagePlaceholderText}>
            {otherUser.storeName ? otherUser.storeName.charAt(0).toUpperCase() : otherUser.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      
        <View>
          <Text style={styles.username}>{otherUser.storeName||otherUser.username}</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>
      
      {/* Main chat container with KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
      >
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
            onRefresh={() => fetchMessages(conversationId)}
            refreshing={loading}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            style={styles.messagesContainer}
          />
        )}
        
        {/* Input area */}
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
    </SafeAreaView>
  );
};

// Styles for the StoreHeader component

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
  messagesContainer: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  }, 
  appointmentMessage: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#155366',
    padding: 12,
    paddingTop: 30,
  },
 
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    color: '#cce6cc',
    fontSize: 12,
  },
  appointmentHeaderText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  appointmentDetails: {
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  appointmentDetail: {
    fontSize: 13,
    marginVertical: 2,
  },

  headerAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleTextContainer: {
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 180,
  },
  headerSubtitleText: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 2,
  },
  headerBackButton: {
    marginLeft: 8,
    padding: 8,
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
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
    paddingHorizontal: 2,
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
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
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