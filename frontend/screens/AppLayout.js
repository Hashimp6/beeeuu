import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import HomeScreen from './HomeScreen';
import LocationSelectionModal from '../components/LocationSelection';
import ProfileScreen from '../components/ProfileScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import StoreSearchPage from './SearchStoreScreen';

const AppLayout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get initial tab from route params, default to 'Home'
  const initialTab = route.params?.initialTab || 'Home';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [locationUpdateTrigger, setLocationUpdateTrigger] = useState(0);

  // Update active tab when route params change
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // Check for user location on component mount
  useEffect(() => {
    const checkUserLocation = async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem('user');
        
        if (storedUserJson) {
          let storedUser = JSON.parse(storedUserJson);
          setUser(storedUser);
          
          // If location not available, show the location modal
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
  const handleLocationUpdate = useCallback(async (updatedUser) => {
    if (updatedUser) {
      // Save the updated user to AsyncStorage first
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Then update state
      setUser(updatedUser);
      
      // Increment the update trigger to force HomeScreen to refresh
      setLocationUpdateTrigger(prev => prev + 1);
    }
    setLocationModalVisible(false);
  }, []);

  // Function to open location modal manually
  const openLocationModal = () => {
    setLocationModalVisible(true);
  };

  // Handle tab navigation - you can also navigate to specific routes if needed
  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    
    // Optional: If you want to use navigation instead of local state
    // navigation.navigate('Home', { initialTab: tabName });
  };

  // Function to render the content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen 
            userLocation={user ? {
              latitude: user.latitude,
              longitude: user.longitude,
              locationName: user.locationName || 'Selected Location'
            } : null}
            locationUpdateTrigger={locationUpdateTrigger}
          />
        );
      case 'Search':
        return  <StoreSearchPage/>
      case 'Profile':
        return <ProfileScreen />;
      
      default:
        return (
          <HomeScreen 
            userLocation={user ? {
              latitude: user.latitude,
              longitude: user.longitude,
              locationName: user.locationName || 'Selected Location'
            } : null}
            locationUpdateTrigger={locationUpdateTrigger}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container} edges={[, 'left', 'right']}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false}
      />
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/log.png')} // adjust path as needed
          style={styles.logo}
        />

        <View style={styles.iconContainer}>
          {/* Location Icon with current location name */}
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

          {/* Modern Message Icon (Chat Bubble) */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('ChatListScreen')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#333" />
            {/* <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View> */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area - Direct rendering without ScrollView wrapper */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]} 
          onPress={() => handleTabPress('Home')}
        >
          <Ionicons 
            name={activeTab === 'Home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'Home' ? "#155366" : '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Search' && styles.activeNavItem]} 
          onPress={() => handleTabPress('Search')}
        >
          <Ionicons 
            name={activeTab === 'Search' ? 'search' : 'search-outline'} 
            size={24} 
            color={activeTab === 'Search' ? "#155366": '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Search' && styles.activeNavText]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Profile' && styles.activeNavItem]} 
          onPress={() => handleTabPress('Profile')}
        >
          <Ionicons 
            name={activeTab === 'Profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'Profile' ? "#155366": '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Selection Modal */}
      <LocationSelectionModal 
        visible={locationModalVisible} 
        onClose={handleLocationUpdate} 
      />
      </SafeAreaView>
      </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Add this line
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 10,
    paddingVertical: 1, // Increased from 5
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD', // More visible border
    backgroundColor: '#FFFFFF', // Explicit background
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 7,
      },
    }),
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
// Add this new style
bottomNavContainer: {
  paddingBottom: Platform.OS === 'ios' ? 0 : 10, // Extra padding for Android
},

// Update bottomNav style:
bottomNav: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  borderTopWidth: 1,
  borderTopColor: '#DDDDDD', // More visible
  paddingVertical: 8, // Increased from 4
  backgroundColor: '#FFFFFF',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    android: {
      elevation: 8,
    },
  }),
},
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppLayout;