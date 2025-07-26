import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../config';

const { width, height } = Dimensions.get('window');

const OffersStories = ({ storeId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { token } = useAuth();


  useEffect(() => {
    fetchOffers();
  }, [storeId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/offers/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setOffers(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch offers');
      console.error('Error fetching offers:', err);
      Alert.alert('Error', 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSavings = (original, offer) => {
    return original - offer;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.loadingContainer}
        >
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.loadingSkeleton} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!offers.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No offers available</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
      
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersContainer}
        >
          {offers.map((offer, index) => (
            <TouchableOpacity
              key={offer._id || index}
              onPress={() => handleOfferClick(offer)}
              style={styles.offerItem}
              activeOpacity={0.8}
            >
              <View style={styles.offerImageContainer}>
                <View style={styles.offerImageBorder}>
                  {offer.image ? (
                    <Image
                      source={{ uri: offer.image }}
                      style={styles.offerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text style={styles.placeholderText}>
                        {offer.discountValue || offer.title?.substring(0, 10) || 'Offer'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text style={styles.offerTitle} numberOfLines={1}>
                {offer.title || `Offer ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                {selectedOffer?.image && (
                  <Image
                    source={{ uri: selectedOffer.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.modalContent}>
                {/* Title */}
                <Text style={styles.modalTitle}>
                  {selectedOffer?.title}
                </Text>

                {/* Description */}
                {selectedOffer?.description && (
                  <Text style={styles.modalDescription}>
                    {selectedOffer.description}
                  </Text>
                )}

                {/* Pricing Section */}
                <View style={styles.pricingContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Original Price:</Text>
                    <View style={styles.priceValue}>
                      <Text style={styles.originalPrice}>
                        ₹{selectedOffer?.originalPrice}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Offer Price:</Text>
                    <Text style={styles.offerPrice}>
                      ₹{selectedOffer?.offerPrice}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>You Save:</Text>
                    <Text style={styles.savingsPrice}>
                      ₹{calculateSavings(selectedOffer?.originalPrice, selectedOffer?.offerPrice)}
                    </Text>
                  </View>
                </View>

                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {selectedOffer?.discountValue}
                    {selectedOffer?.discountType === 'percentage' ? '% OFF' : ' OFF'}
                  </Text>
                </View>

                {/* Validity */}
                <View style={styles.validityContainer}>
                  <View style={styles.validityHeader}>
                    <Ionicons name="calendar-outline" size={16} color="#2563eb" />
                    <Text style={styles.validityTitle}>Offer Validity</Text>
                  </View>
                  <View style={styles.validityContent}>
                    <Text style={styles.validityText}>
                      <Text style={styles.validityLabel}>Valid From:</Text> {formatDate(selectedOffer?.validFrom)}
                    </Text>
                    <Text style={styles.validityText}>
                      <Text style={styles.validityLabel}>Valid Till:</Text> {formatDate(selectedOffer?.validTo)}
                    </Text>
                  </View>
                </View>

                {/* Category */}
                {selectedOffer?.category && (
                  <View style={styles.categoryContainer}>
                    <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {selectedOffer.category}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Premium Badge */}
                {selectedOffer?.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>★ Premium Offer</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  loadingSkeleton: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 12,
  },
  errorContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  offersContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    flexGrow: 1,  
  },
  offerItem: {
    marginRight: 12,
    alignItems: 'center',
    width: 80,
  },
  offerImageContainer: {
    marginBottom: 4,
  },
  offerImageBorder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'Teal',
    padding: 2,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  placeholderText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  offerTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4b5563',
    maxWidth: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxWidth: width - 32,
    width: '100%',
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 192,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalDescription: {
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  pricingContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#4b5563',
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  savingsPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  discountText: {
    color: 'white',
    fontWeight: '600',
  },
  validityContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  validityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validityTitle: {
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 8,
  },
  validityContent: {
    gap: 4,
  },
  validityText: {
    fontSize: 14,
    color: '#4b5563',
  },
  validityLabel: {
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
  },
  premiumBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OffersStories;