
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Linking,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const OfferDetailsModal = ({ 
  visible, 
  offer, 
  onClose, 
  onCallStore, 
  onGetDirections,
  userLocation // { latitude, longitude }
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [timeRemaining, setTimeRemaining] = useState({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Countdown timer effect
  useEffect(() => {
    if (!offer || !visible) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(offer.validTo).getTime();
      const timeDiff = endTime - now;

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds, expired: false };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }
    };


  
    

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    updateTimer(); // Initial calculation
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [offer, visible]);

  if (!offer) return null;

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
  };

  const getDaysRemaining = (validTo) => {
    const today = new Date();
    const endDate = new Date(validTo);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Calculate distance between user location and store
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
  };

  const getStoreDistance = () => {
    if (!userLocation || !offer.storeId?.latitude || !offer.storeId?.longitude) {
      return null;
    }
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      offer.storeId.latitude,
      offer.storeId.longitude
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  const discountPercent = Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100);
  const daysRemaining = getDaysRemaining(offer.validTo);
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0 || timeRemaining.expired;
  const storeDistance = getStoreDistance();

  const handleCall = () => {
    if (offer.storeId?.phone) {
      Linking.openURL(`tel:${offer.storeId.phone}`);
    }
  };

  const formatStoreNameForURL = (name) => {
    return name?.toLowerCase().replace(/\s+/g, '-');
  };

  const goToSellerProfile = () => {
    const formattedName = formatStoreNameForURL(offer.storeId?.storeName);
    navigation.navigate('SellerProfile', { name: formattedName });
  };

  const openImageViewer = () => {
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const formatCountdownTime = (time) => {
    return String(time).padStart(2, '0');
  };

  // Full Screen Image Viewer Component
  const ImageViewer = () => (
    <Modal
      visible={showImageViewer}
      transparent={true}
      animationType="fade"
      onRequestClose={closeImageViewer}
    >
      <View style={styles.imageViewerContainer}>
        <StatusBar hidden />
        <TouchableOpacity 
          style={styles.imageViewerBackdrop} 
          activeOpacity={1}
          onPress={closeImageViewer}
        />
        
        <View style={styles.imageViewerContent}>
          <TouchableOpacity 
            style={styles.imageCloseButton}
            onPress={closeImageViewer}
          >
            <Text style={styles.imageCloseButtonText}>✕</Text>
          </TouchableOpacity>
          
          <Image 
            source={{ uri: offer.image }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={onClose}
          />
          
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Offer Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Offer Image */}
              <View style={styles.imageSection}>
                <TouchableOpacity onPress={openImageViewer}>
                  <Image 
                    source={{ uri: offer.image }} 
                    style={styles.modalOfferImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                
                {/* Discount Badge */}
                <View style={styles.modalDiscountBadge}>
                  <Text style={styles.modalDiscountText}>{discountPercent}% OFF</Text>
                </View>

                {/* Premium Badge */}
                {offer.isPremium && (
                  <View style={styles.modalPremiumBadge}>
                    <Text style={styles.modalPremiumText}>PREMIUM</Text>
                  </View>
                )}
              </View>

              {/* Offer Title & Description */}
              <View style={styles.offerInfoSection}>
                <Text style={styles.modalOfferTitle}>{offer.title}</Text>
                <Text style={styles.modalOfferDescription}>{offer.description}</Text>
              </View>

              {/* Countdown Timer Section */}
              {!isExpired && (
                <View style={styles.countdownSection}>
                  <Text style={styles.countdownTitle}>⏱️ Offer Ends In</Text>
                  <View style={styles.countdownContainer}>
                    <View style={styles.countdownItem}>
                      <Text style={styles.countdownNumber}>{formatCountdownTime(timeRemaining.days)}</Text>
                      <Text style={styles.countdownLabel}>Days</Text>
                    </View>
                    <Text style={styles.countdownSeparator}>:</Text>
                    <View style={styles.countdownItem}>
                      <Text style={styles.countdownNumber}>{formatCountdownTime(timeRemaining.hours)}</Text>
                      <Text style={styles.countdownLabel}>Hours</Text>
                    </View>
                    <Text style={styles.countdownSeparator}>:</Text>
                    <View style={styles.countdownItem}>
                      <Text style={styles.countdownNumber}>{formatCountdownTime(timeRemaining.minutes)}</Text>
                      <Text style={styles.countdownLabel}>Min</Text>
                    </View>
                    <Text style={styles.countdownSeparator}>:</Text>
                    <View style={styles.countdownItem}>
                      <Text style={styles.countdownNumber}>{formatCountdownTime(timeRemaining.seconds)}</Text>
                      <Text style={styles.countdownLabel}>Sec</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Price Section */}
              <View style={styles.modalPriceSection}>
                <View style={styles.modalPriceRow}>
                  <Text style={styles.modalOfferPriceLabel}>Offer Price</Text>
                  <View style={styles.modalPriceDisplay}>
                    <Text style={styles.modalRupeeSymbol}>₹</Text>
                    <Text style={styles.modalOfferPrice}>{offer.offerPrice}</Text>
                  </View>
                </View>
                
                <View style={styles.modalOriginalPriceRow}>
                  <Text style={styles.modalOriginalPriceLabel}>Original Price</Text>
                  <Text style={styles.modalOriginalPrice}>₹{offer.originalPrice}</Text>
                </View>
                
                <View style={styles.modalSavingsRow}>
                  <Text style={styles.modalSavingsLabel}>You Save</Text>
                  <Text style={styles.modalSavingsAmount}>₹{offer.originalPrice - offer.offerPrice}</Text>
                </View>
              </View>

              {/* Validity Section */}
              <View style={styles.modalValiditySection}>
                <Text style={styles.modalSectionTitle}>Offer Validity</Text>
                
                <View style={styles.modalValidityRow}>
                  <Text style={styles.modalValidityLabel}>Valid From:</Text>
                  <Text style={styles.modalValidityDate}>{formatDate(offer.validFrom)}</Text>
                </View>
                
                <View style={styles.modalValidityRow}>
                  <Text style={styles.modalValidityLabel}>Valid To:</Text>
                  <Text style={styles.modalValidityDate}>{formatDate(offer.validTo)}</Text>
                </View>

              
              </View>

              {/* Store Information */}
              <View style={styles.modalStoreSection}>
                <Text style={styles.modalSectionTitle}>Store Information</Text>
                
                <View style={styles.modalStoreRow}>
                  <Image 
                    source={{ uri: offer.storeId?.profileImage }} 
                    style={styles.modalStoreAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.modalStoreDetails}>
                    <Text style={styles.modalStoreName}>{offer.storeId?.storeName}</Text>
                    <View style={styles.storeMetaRow}>
                      <Text style={styles.modalStoreRating}>⭐ {offer.storeId?.averageRating}</Text>
                      {storeDistance && (
                        <Text style={styles.storeDistance}>📍 {storeDistance} away</Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.modalStoreInfoRow}>
                  <Text style={styles.modalStoreInfoLabel}>Location:</Text>
                  <Text style={styles.modalStoreInfoValue}>{offer.place}</Text>
                </View>

                <View style={styles.modalStoreInfoRow}>
                  <Text style={styles.modalStoreInfoLabel}>Phone:</Text>
                  <TouchableOpacity onPress={handleCall}>
                    <Text style={styles.modalPhoneNumber}>{offer.storeId?.phone}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalStoreInfoRow}>
                  <Text style={styles.modalStoreInfoLabel}>Category:</Text>
                  <Text style={styles.modalCategoryTag}>{offer.category}</Text>
                </View>
              </View>
<View style={styles.modalStoreButtonWrapper}>
  <TouchableOpacity onPress={goToSellerProfile} style={styles.modalStoreButton}>
    <Text style={styles.modalStoreButtonText}>Visit Store Profile</Text>
  </TouchableOpacity>
</View>

            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Full Screen Image Viewer */}
      <ImageViewer />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
  },
  modalStoreButtonWrapper: {
    marginTop: 25,
    alignItems: 'center',
    marginBottom: 30, // spacing before bottom
  },
  
  modalStoreButton: {
    backgroundColor: '#008080', // Teal color
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  
  modalStoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Image Section
  imageSection: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 25,
  },
  modalOfferImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  modalDiscountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FF1744',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  modalDiscountText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modalPremiumBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  modalPremiumText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },

  // Offer Info Section
  offerInfoSection: {
    marginBottom: 25,
  },
  modalOfferTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 10,
    lineHeight: 30,
  },
  modalOfferDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 24,
  },

  // Countdown Section
  countdownSection: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffecb3',
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 15,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#856404',
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginTop: 2,
  },
  countdownSeparator: {
    fontSize: 20,
    fontWeight: '900',
    color: '#856404',
    marginHorizontal: 8,
  },

  // Price Section
  modalPriceSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalOfferPriceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalPriceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modalRupeeSymbol: {
    fontSize: 20,
    fontWeight: '900',
    color: '#20B2AA',
    marginRight: 2,
  },
  modalOfferPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#20B2AA',
    letterSpacing: -1,
  },
  modalOriginalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalOriginalPriceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  modalOriginalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  modalSavingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalSavingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  modalSavingsAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#28a745',
  },

  // Validity Section
  modalValiditySection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  modalValidityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalValidityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  modalValidityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalTimeRemainingContainer: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTimeRemainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  modalExpiringText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6b35',
  },
  modalExpiredText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc3545',
  },

  // Store Section
  modalStoreSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  modalStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalStoreAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#20B2AA',
    marginRight: 15,
  },
  modalStoreDetails: {
    flex: 1,
  },
  modalStoreName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  modalStoreRating: {
    fontSize: 16,
    fontWeight: '600',
  },
  storeDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20B2AA',
    backgroundColor: 'rgba(32, 178, 170, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalStoreInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalStoreInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
  },
  modalStoreInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 2,
    textAlign: 'right',
  },
  modalPhoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
    textDecorationLine: 'underline',
  },
  modalCategoryTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20B2AA',
    backgroundColor: 'rgba(32, 178, 170, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Full Screen Image Viewer
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageCloseButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
});

export default OfferDetailsModal;