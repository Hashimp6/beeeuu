import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AppointmentCard from '../components/AppointmentCard';

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
        socket.off('message-sent');
        socket.emit('leave', { conversationId });
      }
    };
  }, [otherUser, user, token, socket, conversationId]); 

  // Process pending appointment once we have a conversation ID
  useEffect(() => {
    if (pendingAppointment && conversationId) {
     sendAppointmentMessage(pendingAppointment.message, pendingAppointment.data);
      setPendingAppointment(null);
    }
  }, [pendingAppointment, conversationId]);

  // Setup socket connection and listeners
  const setupSocketConnection = (chatId) => {
    if (!socket || !chatId) return;
    
    // Join conversation room
    socket.emit('join', { conversationId: chatId });
    
    // Listen for new messages
    socket.on('new-message', (data) => {
     
      // Only update if it's for our conversation
      if (data.conversationId === chatId) {
        const newMessage = {
          _id: data.message._id?.toString() || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: data.message.text,
          sender: data.message.sender,
          createdAt: data.message.createdAt,
          messageType: data.message.type || 'text',
          appointmentData: data.message.appointmentData || null,
          image: data.message.image || null
        };
        
       
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
  
  // Send appointment message function
  const sendAppointmentMessage = async (messageText, appointmentData) => {
    if (!conversationId || !otherUser?._id || sending) return;
    
    try {
      setSending(true);
      
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
        appointmentData: appointmentData
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
          messageType: 'appointment',
          appointmentData: appointmentData
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
          messageType: response.data.data.type || 'appointment'
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
      console.error('Error sending appointment message:', error);
      Alert.alert('Error', 'Failed to send appointment');
      
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
          messageType: response.data.data.type || 'text'
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
    
    // Handle different message types
    const messageType = item.messageType || 'text';
    
    // Special handling for appointment messages
    if (messageType === 'appointment' && item.appointmentData) {
      return (
        <View style={[
          isOwnMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
          item.pending && { opacity: 0.7 },
          item.failed && { borderWidth: 1, borderColor: '#FF3B30', borderRadius: 12 },
          { marginVertical: 4, maxWidth: '85%' }
        ]}>
          <AppointmentCard appointmentData={item.appointmentData} />
          
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
    
    // Handle image messages
    if (messageType === 'image' && item.image) {
      return (
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          item.pending && styles.pendingMessage,
          item.failed && styles.failedMessage,
          { padding: 4 }
        ]}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
          
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
    }
    
    // For regular text messages
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
      <TouchableOpacity 
    style={styles.backButton} 
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>
        {otherUser.avatar ? (
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
          <Text style={styles.username}>{otherUser.storeName || otherUser.username}</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  storeImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 2,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 18,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.7,
  },
  failedMessage: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  ownTimestamp: {
    color: '#FFFFFF',
  },
  otherTimestamp: {
    color: '#000000',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputIconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    minHeight: 36,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  attachButton: {
    padding: 4,
    marginLeft: 4,
  },
  cameraButton: {
    padding: 4,
    marginLeft: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonInactive: {
    backgroundColor: '#000',
  },
});

export default ChatDetailScreen;