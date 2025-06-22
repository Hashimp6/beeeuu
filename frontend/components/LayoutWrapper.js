import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet,  Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import LocationSelectionModal from '../components/LocationSelection';

const AppLayoutWrapper = ({ children, screenName }) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get current screen name for active tab
  const currentScreen = screenName || route.name;

  // Check for user location on component mount
  useEffect(() => {
    const checkUserLocation = async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem('user');
        
        if (storedUserJson) {
          let storedUser = JSON.parse(storedUserJson);
          setUser(storedUser);
          
          // If location not available, show the modal
          if (!storedUser.latitude || !storedUser.longitude) {
            setLocationModalVisible(true);
          }
        } else {
          // No user data stored yet, create one and show location modal
          const newUser = { id: Date.now().toString() };
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          setLocationModalVisible(true);
        }
      } catch (error) {
        console.error('Error checking user location:', error);
      }
    };
    
    checkUserLocation();
  }, []);

  // Function to handle location modal close and update
  const handleLocationUpdate = async (updatedUser) => {
    if (updatedUser) {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    setLocationModalVisible(false);
  };

  // Function to open location modal manually
  const openLocationModal = () => {
    setLocationModalVisible(true);
  };

  // Navigation functions for bottom tabs
  const navigateToTab = (screenName) => {
    navigation.navigate(screenName);
  };

  // Check if current screen is active
  const isActiveTab = (tabName) => {
    return currentScreen === tabName;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/log.png')} 
          style={styles.logo}
        />

        <View style={styles.iconContainer}>
          {/* Location Button */}
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={openLocationModal}
          >
            <Ionicons name="location-outline" size={20} color="#333" />
            <Text style={styles.locationText} numberOfLines={1}>
              {user?.locationName || 'Set location'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          {/* Chat Button */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('ChatListScreen')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#333" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, isActiveTab('Home') && styles.activeNavItem]} 
          onPress={() => navigateToTab('Home')}
        >
          <Ionicons 
            name={isActiveTab('Home') ? 'home' : 'home-outline'} 
            size={24} 
            color={isActiveTab('Home') ? "#155366" : '#555'} 
          />
          <Text style={[styles.navText, isActiveTab('Home') && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, isActiveTab('Search') && styles.activeNavItem]} 
          onPress={() => navigateToTab('Search')}
        >
          <Ionicons 
            name={isActiveTab('Search') ? 'search' : 'search-outline'} 
            size={24} 
            color={isActiveTab('Search') ? "#155366": '#555'} 
          />
          <Text style={[styles.navText, isActiveTab('Search') && styles.activeNavText]}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, isActiveTab('Profile') && styles.activeNavItem]} 
          onPress={() => navigateToTab('Profile')}
        >
          <Ionicons 
            name={isActiveTab('Profile') ? 'person' : 'person-outline'} 
            size={24} 
            color={isActiveTab('Profile') ? "#155366": '#555'} 
          />
          <Text style={[styles.navText, isActiveTab('Profile') && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Selection Modal */}
      <LocationSelectionModal 
        visible={locationModalVisible} 
        onClose={handleLocationUpdate} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  logo: {
    width: 120,
    height: 55,
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 13,
    marginHorizontal: 4,
    maxWidth: 100,
  },
  iconButton: {
    marginLeft: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#155366',
  },
  navText: {
    fontSize: 11,
    marginTop: 1,
    color: '#555',
  },
  activeNavText: {
    color: "#155366",
    fontWeight: '600',
  },
});

export default AppLayoutWrapper;