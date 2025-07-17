import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, X, Locate, AlertCircle, Loader } from 'lucide-react';
import { SERVER_URL } from '../Config';
import axios from 'axios';
import { useAuth } from '../context/UserContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';

const LocationSelectionModal = ({ visible, onClose }) => {
  const { user,token, setUser} = useAuth(); // Get user and updateUser from auth context
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Clear error when search query changes
  useEffect(() => {
    if (error) setError(null);
  }, [searchQuery]);

  // Load saved location from user data
  useEffect(() => {
    if (visible && user) {
      // Set current location name in search if user has one
      if (user.place) {
        setSearchQuery(user.place);
      }
    } else {
      // Clear search query when modal is closed
      setSearchQuery('');
      setSuggestions([]);
      setError(null);
    }
  }, [visible, user]);

  // Function to get location suggestions using Google Places API
  const fetchLocationSuggestions = useCallback(async (query) => {
    console.log('🔍 Starting location search for:', query);
    
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (!isGoogleMapsLoaded) {
      console.log('Google Maps API not loaded yet');
      return;
    }

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setError('Google Maps API key not configured');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      const request = {
        input: query,
        types: ['geocode']
      };
      
      service.getPlacePredictions(request, (predictions, status) => {
        setLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
         
          setSuggestions(predictions);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        
          setSuggestions([]);
        } else {
          setError('Location search failed. Please try again.');
          setSuggestions([]);
        }
      });
    } catch (err) {
      console.error('🚨 Full Error Details:', err);
      setError('Search failed. Please try again.');
      setSuggestions([]);
      setLoading(false);
    }
  }, [isGoogleMapsLoaded]);
  
  // Debounced search effect
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

  // Get coordinates from place_id using Google Places API
  const getCoordinatesFromPlaceId = async (placeId) => {
    if (!isGoogleMapsLoaded) {
      setError('Google Maps API not loaded');
      return null;
    }

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setError('Google Maps API key not configured');
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        
        service.getDetails({
          placeId: placeId,
          fields: ['geometry']
        }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
            resolve({
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            });
          } else {
            reject(new Error(`Could not get coordinates: ${status}`));
          }
        });
      });
    } catch (err) {
      setError('Failed to get location coordinates. Please try again.');
      return null;
    }
  };

  // Update user location with real API call
  const updateUserLocation = async (coordinates, locationName) => {
    try {
      if (!user?._id || !token) {
        throw new Error('User not authenticated');
      }

      // Update on the server
      const response = await axios.put(
        `${SERVER_URL}/users/location/${user._id}`,
        {
          coordinates: [coordinates.longitude, coordinates.latitude], 
          locationName: locationName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user in auth context
      const updatedUser = {
        ...user,
        location: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
        locationName: locationName,
        place:locationName
      };
      
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('❌ Location update failed:', err);
      throw new Error('Failed to update location data');
    }
  };

  // Handle location selection
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
      
      try {
        // Update user location
        const updatedUser = await updateUserLocation(
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

  // Handle getting current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
        return;
      }
      
      // Get current position with promise wrapper
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
      
      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates (reverse geocoding)
      let locationName = 'Current Location';
      
      if (isGoogleMapsLoaded && window.google && window.google.maps) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = new window.google.maps.LatLng(latitude, longitude);
          
          const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0].formatted_address);
              } else {
                reject(new Error('Geocoder failed'));
              }
            });
          });
          
          locationName = result || 'Current Location';
        } catch (geocodeErr) {
          console.error('Reverse geocoding failed:', geocodeErr);
          // Continue with default location name
        }
      }
      
      try {
        // Update user location
        const updatedUser = await updateUserLocation(
          { latitude, longitude },
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
      
      // Handle specific geolocation errors
      if (err.code === 1) {
        setError('Location access denied. Please enable location services and try again.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please check your connection and try again.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError('Failed to get current location. Please try again or search manually.');
      }
      setLoading(false);
    }
  };

  // Don't render if not visible or no user
  if (!visible || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[19999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Select Your Location</h2>
            {user.locationName && (
              <p className="text-sm text-gray-600 mt-1">
                Current: {user.locationName}
              </p>
            )}
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <p className="text-gray-600 mb-4">
            Please select your location to see nearest stores
          </p>
          
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {/* Loading Google Maps API */}
          {!isGoogleMapsLoaded && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Loader size={16} className="animate-spin text-blue-500 flex-shrink-0" />
              <span className="text-blue-700 text-sm">Loading Google Maps...</span>
            </div>
          )}
          
          {/* Search Input */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={!isGoogleMapsLoaded}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading || !isGoogleMapsLoaded}
            className="flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-4 disabled:opacity-50"
          >
            <Locate size={18} />
            <span>Use my current location</span>
          </button>
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader size={24} className="animate-spin text-blue-600" />
            </div>
          )}
          
          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <MapPin size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-2">{item.description}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* No Results */}
          {!loading && searchQuery.length > 2 && suggestions.length === 0 && isGoogleMapsLoaded && (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionModal;