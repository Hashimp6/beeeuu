import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import OfferDetailsModal from '../components/OfferDetailedModel';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../config';

const { width, height } = Dimensions.get('window');

const OffersReelsFeed = ({ onOfferPress }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [screenHeight, setScreenHeight] = useState(height);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollViewRef = useRef(null);
  const { user } = useAuth();

  const BATCH_SIZE = 20;
  const PREFETCH_THRESHOLD = 15;

  // Calculate exact screen height for proper snapping
  useEffect(() => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const headerHeight = 40;
    const bottomNavHeight = 45;
    const availableHeight = height - statusBarHeight - headerHeight - bottomNavHeight;
    
    setScreenHeight(availableHeight);
  }, []);

  // Initial load
  useEffect(() => {
    if (user && user.location?.coordinates?.length === 2) {
      fetchNearbyOffers(true);
    }
  }, [user]);

  // Fetch nearby offers function
  const fetchNearbyOffers = async (isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;

    try {
      setLoading(true);
      if (isInitial) {
        setRefreshing(true);
      }

      const [lng, lat] = user.location.coordinates;
      const skip = isInitial ? 0 : currentPage * BATCH_SIZE;

      const response = await axios.get(`${SERVER_URL}/offers/nearby`, {
        params: {
          lat,
          lng,
          userId: user._id,
          skip,
          batchSize: BATCH_SIZE,
        },
      });

      if (response.data.success) {
        const newOffers = response.data.data;
        console.log(response.data.data);
        
        if (isInitial) {
          setOffers(newOffers);
          setCurrentPage(1);
          setCurrentIndex(0); // Reset to first offer
        } else {
          setOffers(prevOffers => [...prevOffers, ...newOffers]);
          setCurrentPage(prevPage => prevPage + 1);
        }

        setHasMore(newOffers.length === BATCH_SIZE);
      } else {
        console.warn("No offers found:", response.data.message);
        if (isInitial) {
          setOffers([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch nearby offers:", error);
      Alert.alert(
        "Error",
        "Failed to load offers. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced scroll handler with better snap detection
  const handleScroll = useCallback((event) => {
    const { contentOffset } = event.nativeEvent;
    const currentScrollIndex = Math.round(contentOffset.y / screenHeight);
    
    // Only update if the index actually changed
    if (currentScrollIndex !== currentIndex && currentScrollIndex >= 0) {
      setCurrentIndex(currentScrollIndex);
    }

    // Load more when reaching the prefetch threshold
    if (
      currentScrollIndex >= offers.length - PREFETCH_THRESHOLD &&
      hasMore &&
      !loading
    ) {
      fetchNearbyOffers(false);
    }
  }, [offers.length, hasMore, loading, screenHeight, currentIndex]);

  // Handle scroll end to ensure proper snapping
  const handleScrollEnd = useCallback((event) => {
    const { contentOffset } = event.nativeEvent;
    const targetIndex = Math.round(contentOffset.y / screenHeight);
    
    // Force snap to the correct position if needed
    if (Math.abs(contentOffset.y - (targetIndex * screenHeight)) > 1) {
      scrollViewRef.current?.scrollTo({
        y: targetIndex * screenHeight,
        animated: true,
      });
    }
    
    setCurrentIndex(targetIndex);
  }, [screenHeight]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
    setCurrentIndex(0);
    fetchNearbyOffers(true);
  }, []);

  // Modal handlers
  const handleMoreDetailsPress = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  const handleCallStore = () => {
    console.log('Calling store:', selectedOffer?.storeId?.phone);
  };

  const handleGetDirections = () => {
    console.log('Getting directions to:', selectedOffer?.place);
  };

  // Format date for display
  const formatValidTill = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-IN', options);
  };

  // Calculate days remaining
  const getDaysRemaining = (validTo) => {
    const today = new Date();
    const endDate = new Date(validTo);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Animated Discount Badge Component
  const AnimatedDiscountBadge = ({ discountPercent }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }, []);

    return (
      <Animated.View
        style={[
          styles.discountBadge,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Text style={styles.discountText}>{discountPercent}% OFF</Text>
      </Animated.View>
    );
  };

  // Offer Card Component
  const OfferCard = ({ offer }) => {
    const discountPercent = Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100);
    const daysRemaining = getDaysRemaining(offer.validTo);

    return (
      <TouchableOpacity 
        style={[styles.offerCard, { height: screenHeight }]}
        onPress={() => onOfferPress?.(offer)}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: offer.image }} 
            style={styles.offerImage}
            resizeMode="cover"
          />
          
          <View style={styles.overlayGradient} />

          {/* Top Section */}
          <View style={styles.topSection}>
            {offer.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
            <View style={styles.distanceContainer}>
              <Text style={styles.distance}>📍 {offer.distanceKm} km</Text>
            </View>
          </View>

          {/* Bottom Content */}
          <View style={styles.bottomContent}>
            {/* Store Row */}
            <View style={styles.storeRow}>
              <Image 
                source={{ uri: offer.storeId?.profileImage }} 
                style={styles.storeAvatar}
                resizeMode="cover"
              />
              <View style={styles.storeDetails}>
                <Text style={styles.storeName}>{offer.storeId?.storeName}</Text>
                <Text style={styles.rating}>⭐ {offer.storeId?.averageRating || '0'}</Text>
              </View>
            </View>

            {/* Offer Title */}
            <Text style={styles.offerTitle} numberOfLines={2}>
              {offer.title}
            </Text>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceDisplay}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <Text style={styles.offerPrice}>{offer.offerPrice}</Text>
              </View>
              <View style={styles.priceAndDiscount}>
                <AnimatedDiscountBadge discountPercent={discountPercent} />
                <View style={styles.originalPriceContainer}>
                  <Text style={styles.wasText}>was</Text>
                  <Text style={styles.originalPrice}>₹{offer.originalPrice}</Text>
                </View>
              </View>
            </View>

            {/* Valid Till Section */}
            <View style={styles.validitySection}>
              <Text style={styles.validTillLabel}>Valid till:</Text>
              <Text style={styles.validTillDate}>{formatValidTill(offer.validTo)}</Text>
              {daysRemaining <= 3 && daysRemaining > 0 && (
                <Text style={styles.urgentText}>Only {daysRemaining} days left!</Text>
              )}
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMoreDetailsPress(offer);
              }}
            >
              <Text style={styles.actionButtonText}> More</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading Component
  const LoadingIndicator = () => (
    <View style={[styles.loadingContainer, { height: screenHeight }]}>
      <ActivityIndicator size="large" color="#20B2AA" />
      <Text style={styles.loadingText}>Loading more offers...</Text>
    </View>
  );

  // Empty State Component
  const EmptyState = () => (
    <View style={[styles.emptyContainer, { height: screenHeight }]}>
      <Text style={styles.emptyTitle}>No Offers Found</Text>
      <Text style={styles.emptySubtitle}>Check back later for new deals!</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Show empty state if no offers and not loading
  if (offers.length === 0 && !loading && !refreshing) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        {offers.map((offer, index) => (
          <OfferCard key={`${offer._id}-${index}`} offer={offer} />
        ))}
        {loading && hasMore && <LoadingIndicator />}
      </ScrollView>

  

      {/* Modal Component */}
      <OfferDetailsModal
        visible={showModal}
        offer={selectedOffer}
        onClose={handleCloseModal}
        onCallStore={handleCallStore}
        onGetDirections={handleGetDirections}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  offerCard: {
    width: width,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },

  // Top Section
  topSection: {
    position: 'absolute',
    top: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  distanceContainer: {
    backgroundColor: 'rgba(32, 178, 170, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  distance: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Bottom Content
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  
  // Store Row
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },

  // Offer Title
  offerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Price Section
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rupeeSymbol: {
    fontSize: 28,
    fontWeight: '900',
    color: '#20B2AA',
    marginRight: 2,
  },
  offerPrice: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
    textShadowColor: 'rgba(32, 178, 170, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  priceAndDiscount: {
    alignItems: 'flex-end',
  },
  discountBadge: {
    backgroundColor: '#FF1744',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  originalPriceContainer: {
    alignItems: 'flex-end',
  },
  wasText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },

  // Valid Till Section
  validitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 8,
  },
  validTillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  validTillDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#20B2AA',
    backgroundColor: 'rgba(32, 178, 170, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.3)',
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF1744',
    marginLeft: 10,
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },

  // Action Button
  actionButton: {
    backgroundColor: '#20B2AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#20B2AA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    marginRight: 8,
  },
  actionArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },

  // Loading Indicator
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Position Indicator
  positionIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  positionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OffersReelsFeed;