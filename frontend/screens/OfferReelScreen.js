import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import OfferDetailsModal from '../components/OfferDetailedModel';


const { width, height } = Dimensions.get('window');

// Your existing sampleOffers data...
const sampleOffers = [
    {
        "_id": "687ce0956161a65cf9efc548",
        "storeId": {
          "_id": "682cdf764acd2732dbbe90d7",
          "storeName": "Diana's Henna Studio",
          "profileImage": "https://res.cloudinary.com/dhed9kuow/image/upload/v1752042211/store_profiles/xthuo1cbj2vi0sq9jmd2.png",
          "place": "Ayoor, Kerala, India",
          "phone": "6485970539",
          "averageRating": 4.2
        },
        "title": "Mega Beauty Sale",
        "description": "Get stunning henna designs at unbeatable prices. Traditional and modern patterns available.",
        "image": "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/chicken-food-ads-design-template-41c5a162667a95621944cc49edf5c058_screen.jpg?ts=1695355301",
        "discountType": "fixed",
        "discountValue": "50",
        "originalPrice": 100,
        "offerPrice": 50,
        "validFrom": "2025-07-19T00:00:00.000Z",
        "validTo": "2025-07-30T00:00:00.000Z",
        "place": "Ayoor, Kerala, India",
        "distance": "2.5 km",
        "category": "Beauty & Wellness",
        "tags": ["beauty", "henna", "traditional"],
        "isPremium": true
      },
      
      {
        "_id": "687ce0956161a65cf9efc549",
        "storeId": {
          "_id": "682cdf764acd2732dbbe90d8",
          "storeName": "Royal Spa & Salon",
          "profileImage": "https://via.placeholder.com/60x60/008080/white?text=RS",
          "place": "Kochi, Kerala, India",
          "phone": "9876543210",
          "averageRating": 4.5
        },
        "title": "Weekend Spa Special",
        "description": "Relax and rejuvenate with our premium spa treatments at amazing discounts.",
        "image": "https://www.dochipo.com/wp-content/uploads/2023/08/traditional-food-poster-design.png",
        "discountType": "percentage",
        "discountValue": "40",
        "originalPrice": 200,
        "offerPrice": 120,
        "validFrom": "2025-07-19T00:00:00.000Z",
        "validTo": "2025-07-30T00:00:00.000Z",
        "place": "Kochi, Kerala, India",
        "distance": "5.2 km",
        "category": "Beauty & Wellness",
        "tags": ["spa", "massage", "wellness"],
        "isPremium": false
      }
];

// Your existing AnimatedDiscountBadge component...
const AnimatedDiscountBadge = ({ discountPercent }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
  
    useEffect(() => {
      // Initial scale-in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
  
      // Continuous pulse animation
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

const OffersReelsFeed = ({ offers = sampleOffers, onOfferPress }) => {
  const [screenHeight, setScreenHeight] = useState(height);
  
  // Add state for modal
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const headerHeight = 40;
    const bottomNavHeight = 45;
    const availableHeight = height - statusBarHeight - headerHeight - bottomNavHeight;
    
    setScreenHeight(availableHeight);
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
    // You can add actual calling logic here
  };

  const handleGetDirections = () => {
    console.log('Getting directions to:', selectedOffer?.place);
    // You can add actual directions logic here (Google Maps, etc.)
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
          
          {/* Enhanced gradient overlay */}
          <View style={styles.overlayGradient} />

          {/* Top Section - Premium Badge & Distance */}
          <View style={styles.topSection}>
            {offer.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
            <View style={styles.distanceContainer}>
              <Text style={styles.distance}>📍 {offer.distance || 'Nearby'}</Text>
            </View>
          </View>

          {/* Bottom Section - Store & Offer Details */}
          <View style={styles.bottomContent}>
            {/* Store Profile Row */}
            <View style={styles.storeRow}>
              <Image 
                source={{ uri: offer.storeId.profileImage }} 
                style={styles.storeAvatar}
                resizeMode="cover"
              />
              <View style={styles.storeDetails}>
                <Text style={styles.storeName}>{offer.storeId.storeName}</Text>
                <Text style={styles.rating}>⭐ {offer.storeId.averageRating}</Text>
              </View>
            </View>

            {/* Offer Title - Compact */}
            <Text style={styles.offerTitle} numberOfLines={1}>
              {offer.title}
            </Text>

            {/* Price Display with Animated Discount Badge */}
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

            {/* Action Button - Updated to use modal handler */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMoreDetailsPress(offer);
              }}
            >
              <Text style={styles.actionButtonText}>View More</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {offers.map((offer) => (
          <OfferCard key={offer._id} offer={offer} />
        ))}
      </ScrollView>

      {/* Add the Modal Component */}
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
  
  // Store Row - Compact
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

  // Offer Title - Streamlined
  offerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Price Section - Hero Display with Animated Discount Badge
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

  // Valid Till Section - Simple and Clean
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

  // Action Button - Eye-catching
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
});


export default OffersReelsFeed