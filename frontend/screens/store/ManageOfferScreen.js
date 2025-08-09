import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { SERVER_URL } from '../../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with padding

const StoreOffers = ({ route, navigation }) => {
    const { store } = route.params;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [deletingOfferId, setDeletingOfferId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch offers from backend
  const fetchOffers = async () => {
    try {
      setLoading(true);
  
      const response = await axios.get(`${SERVER_URL}/offers/store/${store._id}`);
  
      if (response.data.success) {
     setOffers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch offers',
          text2: response.data.message || 'Something went wrong',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };
  

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  // Delete offer
  const handleDeleteOffer = async (offerId) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingOfferId(offerId);
              const response = await fetch(`${SERVER_URL}/offers/${offerId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                setOffers(offers.filter(offer => offer._id !== offerId));
                Alert.alert('Success', 'Offer deleted successfully');
              } else {
                throw new Error('Failed to delete offer');
              }
            } catch (err) {
              Alert.alert('Error', 'Error deleting offer: ' + err.message);
            } finally {
              setDeletingOfferId(null);
            }
          },
        },
      ]
    );
  };

  // Navigate to add offer
  const handleAddOffer = () => {
    navigation.navigate('NewOffer', { store });
  };

  // Navigate to edit offer
  const handleEditOffer = (offer) => {
    navigation.navigate('NewOffer', { store, editOffer: offer });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate discount percentage for fixed discounts
  const getDiscountPercentage = (offer) => {
    if (offer.discountType === 'percent') {
      return `${offer.discountValue}%`;
    } else {
      const percentage = ((offer.discountValue / offer.originalPrice) * 100).toFixed(0);
      return `${percentage}%`;
    }
  };

  useEffect(() => {
    
    if (store?._id) {
      fetchOffers();
    }
  }, [store]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Image 
            source={{ uri: store?.profileImage }} 
            style={styles.storeImage}
          />
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store?.storeName}</Text>
            <Text style={styles.storeLocation}>📍 {store?.place}</Text>
            <Text style={styles.storeRating}>⭐ {store?.averageRating} Rating</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddOffer}>
          <Text style={styles.addButtonText}>+ Add Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {offers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptyDescription}>Create your first offer to attract customers</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleAddOffer}>
              <Text style={styles.createButtonText}>+ Create First Offer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{pagination?.totalOffers || 0}</Text>
                <Text style={styles.statLabel}>Total Offers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.greenText]}>
                  {offers.filter(offer => offer.isActive).length}
                </Text>
                <Text style={styles.statLabel}>Active Offers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.orangeText]}>
                  {offers.filter(offer => offer.isPremium).length}
                </Text>
                <Text style={styles.statLabel}>Premium Offers</Text>
              </View>
            </View>

            {/* Offers Grid */}
            <View style={styles.offersGrid}>
              {offers.map((offer) => (
                <View key={offer._id} style={styles.offerCard}>
                  {/* Offer Image */}
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: offer.image }} 
                      style={styles.offerImage}
                    />
                    <View style={styles.badgeContainer}>
                      <View style={[styles.badge, offer.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.badgeText, offer.isActive ? styles.activeText : styles.inactiveText]}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                      {offer.isPremium && (
                        <View style={[styles.badge, styles.premiumBadge]}>
                          <Text style={styles.premiumText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{getDiscountPercentage(offer)} OFF</Text>
                    </View>
                  </View>

                  {/* Offer Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.offerTitle} numberOfLines={1}>
                      {offer.title}
                    </Text>
                    <Text style={styles.offerDescription} numberOfLines={2}>
                      {offer.description}
                    </Text>

                    {/* Price Info */}
                    <View style={styles.priceContainer}>
                      <View style={styles.priceInfo}>
                        <Text style={styles.offerPrice}>💲₹{offer.offerPrice}</Text>
                        <Text style={styles.originalPrice}>₹{offer.originalPrice}</Text>
                      </View>
                      <Text style={styles.category}>{offer.category}</Text>
                    </View>

                    {/* Validity */}
                    <Text style={styles.validity}>
                      📅 {formatDate(offer.validFrom)} - {formatDate(offer.validTo)}
                    </Text>

                    {/* Tags */}
                    {offer.tags && offer.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        <Text style={styles.tagIcon}>🏷️ </Text>
                        <View style={styles.tags}>
                          {offer.tags.slice(0, 2).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                          {offer.tags.length > 2 && (
                            <Text style={styles.moreTagsText}>+{offer.tags.length - 2}</Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditOffer(offer)}
                      >
                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteOffer(offer._id)}
                        disabled={deletingOfferId === offer._id}
                      >
                        <Text style={styles.deleteButtonText}>
                          {deletingOfferId === offer._id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  storeDetails: {
    marginLeft: 16,
    flex: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  storeLocation: {
    color: '#6b7280',
    marginTop: 4,
  },
  storeRating: {
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: 'teal',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  greenText: {
    color: '#059669',
  },
  orangeText: {
    color: '#ea580c',
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  offerCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
  },
  premiumBadge: {
    backgroundColor: '#fed7aa',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#6b7280',
  },
  premiumText: {
    color: '#9a3412',
    fontSize: 10,
    fontWeight: '500',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  offerDescription: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  category: {
    fontSize: 10,
    color: '#6b7280',
  },
  validity: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagIcon: {
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StoreOffers;