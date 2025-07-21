import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductDetailModal = ({
  visible,
  product,
  onClose,
  likedProducts = new Set(),
  toggleLike = () => {},
  handleOrderProduct = () => {},
  handleAppointment = () => {},
  autoSlide = true,
  slideInterval = 3000,
}) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!autoSlide || !visible) return;

    const interval = setInterval(() => {
      if (product?.images?.length > 0) {
        setCurrentImage((prev) => (prev + 1) % product.images.length);
      }
    }, slideInterval);

    return () => clearInterval(interval);
  }, [product, autoSlide, visible]);

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Image Carousel */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: product.images?.[currentImage] || 'https://via.placeholder.com/400',
              }}
              style={styles.productImage}
            />
            {product.images?.length > 1 && (
              <>
                <TouchableOpacity onPress={() => setCurrentImage((currentImage - 1 + product.images.length) % product.images.length)} style={styles.leftArrow}>
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentImage((currentImage + 1) % product.images.length)} style={styles.rightArrow}>
                  <Ionicons name="chevron-forward" size={24} color="black" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.category}>{product.category}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleLike(product._id)} style={[
                styles.likeButton,
                likedProducts.has(product._id) && styles.liked
              ]}>
                <Ionicons
                  name="heart"
                  size={18}
                  color={likedProducts.has(product._id) ? 'white' : 'gray'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={16} color="#facc15" />
              <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
              )}
            </View>

            <Text style={styles.type}>Type: {product.type}</Text>

            <TouchableOpacity
              onPress={() =>
                product.type === 'service'
                  ? handleAppointment(product)
                  : handleOrderProduct(product)
              }
              style={[
                styles.actionButton,
                product.type === 'service' ? styles.serviceBtn : styles.productBtn,
              ]}
            >
              {product.type === 'service' ? (
                <>
                  <FontAwesome name="calendar" size={16} color="white" />
                  <Text style={styles.buttonText}> Book Now</Text>
                </>
              ) : (
                <>
                  <FontAwesome name="shopping-bag" size={16} color="white" />
                  <Text style={styles.buttonText}> Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
  },
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
    backgroundColor: '#e11d48',
    padding: 5,
    borderRadius: 20,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  leftArrow: {
    position: 'absolute',
    left: 10,
    top: '50%',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
  },
  rightArrow: {
    position: 'absolute',
    right: 10,
    top: '50%',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
  },
  content: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  category: {
    color: 'gray',
    fontSize: 13,
  },
  likeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  liked: {
    backgroundColor: '#dc2626',
  },
  description: {
    fontSize: 13,
    color: '#374151',
    marginVertical: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 4,
    color: '#4b5563',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginLeft: 8,
    color: 'gray',
  },
  type: {
    color: '#6b7280',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  serviceBtn: {
    backgroundColor: '#0f766e',
  },
  productBtn: {
    backgroundColor: '#111827',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});


