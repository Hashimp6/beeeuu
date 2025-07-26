// screens/SubscriptionPlansScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PLANS = [
  { 
    key: 'premium', 
    name: 'Premium', 
    duration: '1 Month',
    price: 240,
    color: ['#667eea', '#764ba2'], // Deep purple premium gradient
    features: ['Basic Analytics', 'Customer Support', 'Mobile App Access'],
    popular: false
  },
  { 
    key: 'premium_6m', 
    name: 'Premium', 
    duration: '6 Months',
    price: 1200,
    originalPrice: 1440,
    color: ['#4c63d2', '#5a67d8'], // Rich premium blue gradient
    features: ['Basic Analytics', 'Customer Support', 'Mobile App Access', '2 Months Free'],
    popular: true
  },
  { 
    key: 'golden', 
    name: 'Golden', 
    duration: '1 Month',
    price: 480,
    color: ['#f6ad55', '#ed8936'], // Luxury gold gradient
    features: ['Advanced Analytics', 'Priority Support', 'All Premium Features', 'Custom Reports'],
    popular: false
  },
  { 
    key: 'golden_6m', 
    name: 'Golden', 
    duration: '6 Months',
    price: 2400,
    originalPrice: 2880,
    color: ['#d69e2e', '#b7791f'], // Ultra luxury deep gold gradient
    features: ['Advanced Analytics', 'Priority Support', 'All Premium Features', 'Custom Reports', '2 Months Free'],
    popular: false
  }
];

const SubscriptionPlansScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { store } = route.params;
  const { user } = useAuth();

  const handleSubscribe = (plan) => {
    const name = store.storeName || 'Store Owner';
    const email = user?.email || 'store@example.com'; 
    const phone = store.phone || '9999999999';

    navigation.navigate('RazorpayCheckout', {
      storeId: store._id,
      name,
      email,
      phone,
      plan: plan.key
    });
  };

  const renderPlanCard = ({ item }) => (
    <View style={styles.planCardContainer}>
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <LinearGradient
        colors={item.color}
        style={[styles.planCard, item.popular && styles.popularCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planDuration}>{item.duration}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
            <Text style={styles.planPrice}>₹{item.price}</Text>
            {item.originalPrice && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  SAVE ₹{item.originalPrice - item.price}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.subscribeButton, item.popular && styles.popularButton]} 
          onPress={() => handleSubscribe(item)}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, item.popular && styles.popularButtonText]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Choose Your Plan</Text>
        <Text style={styles.subheading}>Unlock premium features for your store</Text>
      </View>
      
      <FlatList
        data={PLANS}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a202c',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '400',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  planCardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  popularCard: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  planDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  savingsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  savingsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  featureText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    opacity: 0.95,
  },
  subscribeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  popularButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  popularButtonText: {
    color: '#1a202c',
  },
});

export default SubscriptionPlansScreen;