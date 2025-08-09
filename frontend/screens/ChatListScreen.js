import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Image,
} from "react-native";
import axios from "axios";
import { SERVER_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, isAuthenticated, logout, user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        fetchConversations();
      }
    }, [isAuthenticated])
  );

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${SERVER_URL}/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
     
      setConversations(response.data.conversations || response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      setRefreshing(false);
      alert("Failed to load conversations. Please try again.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleNewChat = () => {
    navigation.navigate("NewChat");
  };

  // Helper function to get the other user from conversation
  const getOtherUser = (conversation) => {
    if (conversation.otherUser) {
      return conversation.otherUser;
    }
    
    // If using members array structure
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
      navigation.navigate("ChatDetail", {
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

// Replace the complex display name logic in your renderItem function with this simplified version:

const renderItem = ({ item }) => {
 
  const otherUser = getOtherUser(item);
  const lastMessage = item.lastMessage || (item.messages && item.messages[item.messages.length - 1]);
  const updatedAt = item.updatedAt || item.createdAt;

  if (!otherUser) {
    return null;
  }

  // SIMPLIFIED LOGIC - based on your actual data structure
  const displayName = otherUser.storeName || otherUser.username || "Unknown User";
  const initials = displayName.substring(0, 2).toUpperCase();
  const hasProfileImage = !!otherUser.profileImage;
  const isStore = !!otherUser.storeName; // true if storeName exists, false otherwise

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={[
        styles.avatar,
        isStore && styles.storeAvatar
      ]}>
        {hasProfileImage ? (
          <Image 
            source={{ uri: otherUser.profileImage }}
            style={styles.profileImage}
            onError={() => console.log('Error loading image:', otherUser.profileImage)}
          />
        ) : (
          <Text style={[
            styles.avatarText,
            isStore && styles.storeAvatarText
          ]}>
            {initials}
          </Text>
        )}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.username} numberOfLines={1}>
            {displayName}
          </Text>
          {isStore && (
            <View style={styles.storeBadge}>
              <Ionicons name="storefront" size={12} color="#4CAF50" />
            </View>
          )}
          <Text style={styles.timeStamp}>{formatTime(updatedAt)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage && lastMessage.content ? 
            lastMessage.content : 
            lastMessage && lastMessage.text ?
              lastMessage.text :
              "Start a conversation"
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubtext}>
        Start chatting with someone new by pressing the button below
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
   
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.conversationId || item._id}
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : styles.listContent
          }
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  listContent: {
    paddingVertical: 10,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  storeAvatar: {
    backgroundColor: "#E8F5E8",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
  },
  storeAvatarText: {
    color: "#4CAF50",
  },
  conversationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  storeBadge: {
    marginLeft: 8,
    marginRight: 8,
  },
  timeStamp: {
    fontSize: 12,
    color: "#888888",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  newChatButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default ChatListScreen;