import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SellerCard = ({
  id,
  image,
  name,
  rating,
  location,
  category,
  description
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('SellerProfile', { name });
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header: Name + Category */}
          <View style={styles.headerRow}>
            <Text style={styles.sellerName} numberOfLines={1}>{name}</Text>
            {category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {description && (
            <Text style={styles.descriptionText} numberOfLines={2}>{description}</Text>
          )}

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#444" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.4,
    borderColor: '#e6e6e6',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  contentContainer: {
    padding: 14,
    paddingTop:8,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    backgroundColor: '#146C94',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginLeft: 6,
    flex: 1,
  },
});

export default SellerCard;
