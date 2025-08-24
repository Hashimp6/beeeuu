import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';

const LocationSelectorModal = ({ onLocationSelect, initialAddress = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [manualAddress, setManualAddress] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.9312, lng: 76.2673 }); // Default to Kochi
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (isModalOpen && activeTab === 'map') {
      loadGoogleMaps();
    }
  }, [isModalOpen, activeTab]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Add marker
    const marker = new window.google.maps.Marker({
      position: mapCenter,
      map: map,
      draggable: true,
      title: 'Delivery Location'
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      reverseGeocode(lat, lng);
    });

    // Handle map click
    map.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocation({
          address: results[0].formatted_address,
          lat,
          lng,
          type: 'map'
        });
      }
    });
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCurrentLocation({ lat, lng });
          setMapCenter({ lat, lng });
          
          // Reverse geocode to get address
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setSelectedLocation({
                  address: results[0].formatted_address,
                  lat,
                  lng,
                  type: 'current'
                });
              }
              setIsLoading(false);
            });
          } else {
            setSelectedLocation({
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              lat,
              lng,
              type: 'current'
            });
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          alert('Unable to get your current location. Please try manual entry or map selection.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLoading(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    if (window.google) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: query,
        fields: ['name', 'formatted_address', 'geometry']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSearchResults(results.slice(0, 5).map(place => ({
            address: place.formatted_address,
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          })));
        }
        setIsLoading(false);
      });
    } else {
      // Fallback mock results for demo
      setTimeout(() => {
        setSearchResults([
          { address: `${query} - Sample Address 1`, name: 'Location 1', lat: 40.7128, lng: -74.0060 },
          { address: `${query} - Sample Address 2`, name: 'Location 2', lat: 40.7580, lng: -73.9855 }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleManualSubmit = () => {
    if (!manualAddress.trim()) return;

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: manualAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setSelectedLocation({
            address: results[0].formatted_address,
            lat: location.lat(),
            lng: location.lng(),
            type: 'manual'
          });
        } else {
          setSelectedLocation({
            address: manualAddress,
            lat: null,
            lng: null,
            type: 'manual'
          });
        }
      });
    } else {
      setSelectedLocation({
        address: manualAddress,
        lat: null,
        lng: null,
        type: 'manual'
      });
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      // Call the parent callback with the selected location
      onLocationSelect(selectedLocation);
      setIsModalOpen(false);
    }
  };

  const TabButton = ({ id, icon: Icon, label, isActive }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center p-4 rounded-lg transition-all ${
        isActive 
          ? 'bg-orange-500 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-full">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        Select Delivery Location
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg h-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Select Location</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="p-6 border-b flex-shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <TabButton
                  id="current"
                  icon={Navigation}
                  label="Current"
                  isActive={activeTab === 'current'}
                />
                <TabButton
                  id="map"
                  icon={MapPin}
                  label="Map"
                  isActive={activeTab === 'map'}
                />
                <TabButton
                  id="manual"
                  icon={Search}
                  label="Search"
                  isActive={activeTab === 'manual'}
                />
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeTab === 'current' && (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Use Current Location</h3>
                      <p className="text-gray-600 text-sm">
                        We'll use your device's GPS to find your exact location
                      </p>
                    </div>
                    
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLoading}
                      className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Getting Location...' : 'Get Current Location'}
                    </button>
                    
                    {currentLocation && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          Location found: {selectedLocation?.address}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'map' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Click on the map or drag the marker to select your delivery location
                    </p>
                    <div
                      ref={mapRef}
                      className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                      {!window.google && (
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Map will load here</p>
                          <p className="text-xs text-gray-400 mt-1">
                            (Requires Google Maps API key)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'manual' && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search or Enter Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualAddress}
                          onChange={(e) => {
                            setManualAddress(e.target.value);
                            searchAddress(e.target.value);
                          }}
                          placeholder="Enter your delivery address..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                          onClick={handleManualSubmit}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isLoading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedLocation({
                              address: result.address,
                              lat: result.lat,
                              lng: result.lng,
                              type: 'search'
                            })}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
                          >
                            <div className="font-medium text-sm">{result.name}</div>
                            <div className="text-xs text-gray-500">{result.address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Location Display - Inside scrollable area */}
              {selectedLocation && (
                <div className="px-6 pb-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">Selected Location</h4>
                        <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-6 border-t flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLocation}
                  disabled={!selectedLocation}
                  className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display selected location outside modal */}
      {selectedLocation && !isModalOpen && (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Selected Location</p>
              <p className="text-xs text-green-700">{selectedLocation.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelectorModal;