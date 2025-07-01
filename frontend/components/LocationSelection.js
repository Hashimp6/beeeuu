import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';
import { SERVER_URL } from '../config';
import Constants from 'expo-constants';

// Get API key from environment variables
const GOOGLE_MAPS_API_KEY = 
  Constants.expoConfig?.extra?.googleMapsApiKey || 
  Constants.manifest?.extra?.googleMapsApiKey ||
  Constants.manifest2?.extra?.googleMapsApiKey;

  
const LocationSelectionModal = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error when search query changes
  useEffect(() => {
    if (error) setError(null);
  }, [searchQuery]);

  useEffect(() => {
    const loadSavedLocation = async () => {
      if (visible) {
        try {
          const storedUserJson = await AsyncStorage.getItem('user');
          if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser.locationName && storedUser.locationName !== 'Current Location') {
              setSearchQuery(storedUser.locationName);
            }
          }
        } catch (err) {
          console.error('Error loading saved location:', err);
        }
      } else {
        // Clear search query when modal is closed
        setSearchQuery('');
        setSuggestions([]);
        setError(null);
      }
    };
  
    loadSavedLocation();
  }, [visible]);
  // Function to get location suggestions - using useCallback for better performance
  // Replace your fetchLocationSuggestions function with this debug version

  const fetchLocationSuggestions = useCallback(async (query) => {
    console.log('🔍 Starting location search for:', query);
    
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
  
    console.log('🔑 API Key check:', {
      exists: !!GOOGLE_MAPS_API_KEY,
      firstChars: GOOGLE_MAPS_API_KEY?.substring(0, 10),
      length: GOOGLE_MAPS_API_KEY?.length
    });
    
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing');
      return;
    }
  
    setLoading(true);
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`;
    
    try {
      // Try with explicit headers and options
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Add user agent for React Native
          'User-Agent': 'React Native App',
        },
        // Add cache control
        cache: 'no-cache',
      });
      
      console.log('📡 Response details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      if (data.status === 'OK') {
        console.log('✅ Success! Found', data.predictions?.length, 'suggestions');
        setSuggestions(data.predictions);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('📭 Zero results');
        setSuggestions([]);
      } else {
        console.error('❌ API Error:', data.status, data.error_message);
        setError(`Location search failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
        setSuggestions([]);
      }
    } catch (err) {
      console.error('🚨 Full Error Details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: err.cause
      });
      
      // More specific error messages
      if (err.message.includes('Network request failed')) {
        setError('Network connection failed. Check your internet connection.');
      } else if (err.message.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError(`Search failed: ${err.message}`);
      }
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);
  
  // Better debounce implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchLocationSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchLocationSuggestions]);

  // Get coordinates from place_id with better error handling
  const getCoordinatesFromPlaceId = async (placeId) => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing');
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result?.geometry?.location) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng
        };
      }
      throw new Error(`Could not get coordinates: ${data.status || 'Unknown error'}`);
    } catch (err) {
      console.error('Get coordinates error:', err);
      setError('Failed to get location coordinates. Please try again.');
      return null;
    }
  };

  // Update user location with better error handling
  const updateUserLocation = async (userData, coordinates, locationName) => {
    try {
      // Create updated user object
      const updatedUser = {
        ...userData,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        locationName: locationName
      };
      
      // Update local storage with new location data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Try to update server if we have userId and token
      if (userData._id && userData.token) {
        try {
          await axios.put(`${SERVER_URL}/users/location/${userData._id}`, {
            coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON format
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userData.token}`,
            },
          });
        } catch (serverErr) {
          console.error('Server update failed, but continuing with local update:', serverErr);
          // We'll continue even if server update fails
        }
      }
      
      return updatedUser;
    } catch (err) {
      console.error('Update user location error:', err);
      throw new Error('Failed to update location');
    }
  };

  // Handle location selection with improved error handling
  const handleSelectLocation = async (item) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get coordinates for the selected place
      const coordinates = await getCoordinatesFromPlaceId(item.place_id);
      if (!coordinates) {
        setLoading(false);
        return;
      }
      
      // Get the stored user data
      const storedUserJson = await AsyncStorage.getItem('user');
      if (!storedUserJson) {
        setError('User data not found');
        setLoading(false);
        return;
      }
      
      const storedUser = JSON.parse(storedUserJson);
      
      try {
        // Update user location
        const updatedUser = await updateUserLocation(
          storedUser, 
          coordinates, 
          item.description
        );
        
        // Close the modal and pass back the selected location data
        onClose(updatedUser);
      } catch (updateError) {
        setError(updateError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Select location error:', err);
      setError('Failed to save location. Please try again.');
      setLoading(false);
    }
  };

  // Handle getting current location with improved error handling
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location services.');
        setLoading(false);
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Get address from coordinates (reverse geocoding)
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Format the address for display
      let locationName = 'Current Location';
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        locationName = [
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
      }
      
      // Get the stored user data
      const storedUserJson = await AsyncStorage.getItem('user');
      if (!storedUserJson) {
        setError('User data not found');
        setLoading(false);
        return;
      }
      
      const storedUser = JSON.parse(storedUserJson);
      
      try {
        // Update user location
        const updatedUser = await updateUserLocation(
          storedUser,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          },
          locationName
        );
        
        // Close the modal and pass back the selected location data
        onClose(updatedUser);
      } catch (updateError) {
        setError(updateError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Get current location error:', err);
      setError('Failed to get current location. Please try again.');
      setLoading(false);
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="location-outline" size={20} color="#555" style={styles.locationIcon} />
      <Text style={styles.suggestionText} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onClose()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Location</Text>
            <TouchableOpacity onPress={() => onClose()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Please select your location to see nearest stores
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
            activeOpacity={0.7}
          >
            <Ionicons name="locate" size={18} color="#007AFF" />
            <Text style={styles.currentLocationText}>Use my current location</Text>
          </TouchableOpacity>
          
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
              maxToRenderPerBatch={15}
              windowSize={10}
            />
          ) : searchQuery.length > 2 && !loading ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  suggestionsList: {
    maxHeight: '60%',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 6,
    fontSize: 14,
    flex: 1,
  },
  loader: {
    marginVertical: 20,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 15,
  },
});

export default LocationSelectionModal;