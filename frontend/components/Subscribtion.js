import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../config';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');


const plans = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Get started for free',
    price: 'Free',
    period: '',
    description: 'Perfect for trying out our platform',
    features: [
      'Limited access to features',
      '1 offer per week',
      'Basic product listings',
      'Limited gallery posts',
      'Community support'
    ],
    buttonText: 'Current Plan',
    buttonStyle: 'outline',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Most popular choice',
    price: '₹240',
    period: '/month',
    description: 'Everything you need to grow your business',
    features: [
      'Daily offer posting',
      'Priority customer support',
      'Full chat & order management',
      'Advanced appointment system',
      'Extended product catalog'
    ],
    buttonText: 'Start Premium',
    buttonStyle: 'primary',
    popular: true,
    planId: 'premium',
    duration: 30,
  },
  {
    id: 'premium6m',
    name: 'Premium 6 Months',
    tagline: 'Best value for money',
    price: '₹1,200',
    originalPrice: '₹1,440',
    period: '/6 months',
    savings: 'Save ₹240',
    description: 'Get 6 months at a discounted rate',
    features: [
      'All Premium features included',
      '6 months of uninterrupted service',
      'Priority support & consultation',
      'Significant cost savings',
      'No renewal hassles'
    ],
    buttonText: 'Get 6 Months',
    buttonStyle: 'primary',
    popular: false,
    planId: 'premium_6m',
    duration: 180,
  },
  {
    id: 'golden',
    name: 'Golden',
    tagline: 'For power users',
    price: '₹480',
    period: '/month',
    description: 'Unlimited access to all features',
    features: [
      'Unlimited offer posting',
      'Dedicated 1-on-1 support',
      'Unlimited products & services',
      'Premium gallery features',
      'Advanced analytics dashboard'
    ],
    buttonText: 'Go Golden',
    buttonStyle: 'golden',
    popular: false,
    planId: 'golden',
    duration: 30,
  },
  {
    id: 'golden6m',
    name: 'Golden 6 Months',
    tagline: 'Ultimate business solution',
    price: '₹2,400',
    originalPrice: '₹2,880',
    period: '/6 months',
    savings: 'Save ₹480',
    description: 'Complete business solution for 6 months',
    features: [
      'All Golden features included',
      '6 months of premium service',
      'VIP support & consultation',
      'Maximum cost savings',
      'Business growth consultation'
    ],
    buttonText: 'Get Golden 6M',
    buttonStyle: 'golden',
    popular: false,
    planId: 'golden_6m',
    duration: 180,
  },
];

const SubscriptionController = () => {
  const route = useRoute();
  const { store } = route.params || {}; 
  
  const { user } = useAuth();
  const [loading, setLoading] = useState({});

  const handleSubscribe = async (plan) => {
    if (plan.price === 'Free') return;

    setLoading(prev => ({ ...prev, [plan.id]: true }));

    try {
      const response = await axios.post(`${SERVER_URL}/payment/razorpay/create-order`, {
        email: user.email,
        phone: user.phone || '',
        name: user.name || user.email,
        plan: plan.planId,
        storeId: store._id,
      });

      if (!response.data.success) {
        Alert.alert('Error', 'Failed to create payment order. Please try again.');
        return;
      }

      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${plan.name} for ${plan.price}${plan.period}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => processPayment(response.data, plan),
            style: 'default'
          },
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to connect to payment service. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const processPayment = async (orderData, plan) => {
    try {
      // Simulate payment processing - replace with actual Razorpay integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Payment Successful! 🎉',
        `Welcome to ${plan.name}! Your subscription is now active.`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'There was an issue processing your payment. Please try again or contact support.'
      );
    }
  };

  const PlanCard = ({ plan }) => {
    const isLoading = loading[plan.id];
    const isFree = plan.price === 'Free';
    const isPremium = plan.buttonStyle === 'primary';
    const isGolden = plan.buttonStyle === 'golden';
    
    const CardWrapper = ({ children }) => {
      if (isPremium) {
        return (
          <LinearGradient
            colors={['#ffffff', '#faf5ff', '#ffffff']}
            style={[styles.planCard, styles.premiumCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.premiumBorder}>
              {children}
            </View>
          </LinearGradient>
        );
      } else if (isGolden) {
        return (
          <LinearGradient
            colors={['#fffbeb', '#fef3c7', '#fffbeb']}
            style={[styles.planCard, styles.goldenCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.goldenBorder}>
              {children}
            </View>
          </LinearGradient>
        );
      } else {
        return (
          <View style={[styles.planCard, plan.popular && styles.popularCard]}>
            {children}
          </View>
        );
      }
    };
    
    return (
      <CardWrapper>
        {plan.popular && (
          <View style={[
            styles.popularBadge,
            isPremium && styles.premiumBadge,
            isGolden && styles.goldenBadge
          ]}>
            <LinearGradient
              colors={isPremium ? ['#8b5cf6', '#a855f7'] : isGolden ? ['#f59e0b', '#d97706'] : ['#9333EA', '#7c3aed']}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.popularBadgeText}>
                {isPremium ? '✨ Most Popular' : isGolden ? '👑 Premium Choice' : 'Most Popular'}
              </Text>
            </LinearGradient>
          </View>
        )}

        {(isPremium || isGolden) && (
          <View style={styles.luxuryAccent}>
            <LinearGradient
              colors={isPremium ? ['#8b5cf6', '#a855f7', '#c084fc'] : ['#f59e0b', '#d97706', '#fbbf24']}
              style={styles.accentLine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planTitleSection}>
            <View style={styles.planNameRow}>
              {isPremium && <Ionicons name="diamond" size={20} color="#8b5cf6" style={styles.planIcon} />}
              {isGolden && <Ionicons name="trophy-outline" size={20} color="#f59e0b" style={styles.planIcon} />}
              <Text style={[
                styles.planName,
                isPremium && styles.premiumPlanName,
                isGolden && styles.goldenPlanName
              ]}>
                {plan.name}
              </Text>
            </View>
            <Text style={[
              styles.planTagline,
              isPremium && styles.premiumTagline,
              isGolden && styles.goldenTagline
            ]}>
              {plan.tagline}
            </Text>
          </View>
          
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={[
                styles.planPrice,
                isPremium && styles.premiumPrice,
                isGolden && styles.goldenPrice
              ]}>
                {plan.price}
              </Text>
              {plan.period && (
                <Text style={[
                  styles.planPeriod,
                  isPremium && styles.premiumPeriod,
                  isGolden && styles.goldenPeriod
                ]}>
                  {plan.period}
                </Text>
              )}
            </View>
            
            {plan.originalPrice && (
              <View style={styles.savingsRow}>
                <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                <LinearGradient
                  colors={isPremium ? ['#dcfce7', '#bbf7d0'] : ['#fef3c7', '#fde68a']}
                  style={styles.savingsGradient}
                >
                  <Text style={[
                    styles.savings,
                    isPremium && styles.premiumSavings,
                    isGolden && styles.goldenSavings
                  ]}>
                    {plan.savings}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>

        <Text style={[
          styles.planDescription,
          isPremium && styles.premiumDescription,
          isGolden && styles.goldenDescription
        ]}>
          {plan.description}
        </Text>

        <View style={styles.featuresSection}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <LinearGradient
                colors={
                  isPremium ? ['#e0e7ff', '#c7d2fe'] : 
                  isGolden ? ['#fef3c7', '#fde68a'] : 
                  ['#DCFCE7', '#bbf7d0']
                }
                style={styles.checkIcon}
              >
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color={
                    isPremium ? '#6366f1' : 
                    isGolden ? '#d97706' : 
                    '#10B981'
                  } 
                />
              </LinearGradient>
              <Text style={[
                styles.featureText,
                isPremium && styles.premiumFeatureText,
                isGolden && styles.goldenFeatureText
              ]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles[`${plan.buttonStyle}Button`],
            isFree && styles.disabledButton
          ]}
          onPress={() => handleSubscribe(plan)}
          disabled={isLoading || isFree}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isPremium ? ['#8b5cf6', '#a855f7'] :
              isGolden ? ['#f59e0b', '#d97706'] :
              plan.buttonStyle === 'outline' ? ['transparent', 'transparent'] : ['#9333EA', '#7c3aed']
            }
            style={[
              styles.buttonGradient,
              plan.buttonStyle === 'outline' && styles.outlineButtonGradient
            ]}
          >
            {isLoading ? (
              <ActivityIndicator 
                size="small" 
                color={plan.buttonStyle === 'outline' ? '#9333EA' : '#ffffff'} 
              />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={[
                  styles.actionButtonText,
                  styles[`${plan.buttonStyle}ButtonText`]
                ]}>
                  {plan.buttonText}
                </Text>
                {!isFree && (
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={plan.buttonStyle === 'outline' ? '#9333EA' : '#ffffff'}
                    style={styles.buttonIcon}
                  />
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </CardWrapper>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Select the perfect plan to grow your business and reach more customers
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Value Props */}
        <View style={styles.valuePropsSection}>
          <Text style={styles.valuePropsTitle}>Why choose our platform?</Text>
          
          <View style={styles.valuePropsGrid}>
            <View style={styles.valueProp}>
              <View style={[styles.valuePropIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="trending-up" size={20} color="#6366F1" />
              </View>
              <Text style={styles.valuePropTitle}>Grow Your Business</Text>
              <Text style={styles.valuePropText}>
                Reach more customers and increase your revenue with our powerful tools
              </Text>
            </View>

            <View style={styles.valueProp}>
              <View style={[styles.valuePropIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <Text style={styles.valuePropTitle}>Secure & Reliable</Text>
              <Text style={styles.valuePropText}>
                Your data is protected with enterprise-grade security and 99.9% uptime
              </Text>
            </View>

            <View style={styles.valueProp}>
              <View style={[styles.valuePropIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="headset" size={20} color="#D97706" />
              </View>
              <Text style={styles.valuePropTitle}>24/7 Support</Text>
              <Text style={styles.valuePropText}>
                Get help whenever you need it with our dedicated support team
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
            <Text style={styles.trustText}>SSL Secured</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="card" size={16} color="#6B7280" />
            <Text style={styles.trustText}>Razorpay Powered</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh" size={16} color="#6B7280" />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  // Plans Container
  plansContainer: {
    gap: 16,
    marginBottom: 40,
  },

  // Plan Card
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  popularCard: {
    borderColor: '#9333EA',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    elevation: 8,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  premiumCard: {
    elevation: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    borderRadius: 18,
  },
  goldenCard: {
    elevation: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderRadius: 20,
  },
  premiumBorder: {
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    padding: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  goldenBorder: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 18,
    padding: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },

  // Luxury Accent
  luxuryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  accentLine: {
    flex: 1,
    height: '100%',
  },

  // Popular Badge
  popularBadge: {
    position: 'absolute',
    top: -14,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  premiumBadge: {
    top: -16,
  },
  goldenBadge: {
    top: -18,
  },
  badgeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Plan Header
  planHeader: {
    marginBottom: 16,
  },
  planTitleSection: {
    marginBottom: 12,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planIcon: {
    marginRight: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  premiumPlanName: {
    color: '#6366f1',
    fontSize: 22,
    fontWeight: '800',
  },
  goldenPlanName: {
    color: '#d97706',
    fontSize: 22,
    fontWeight: '800',
  },
  planTagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  premiumTagline: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  goldenTagline: {
    color: '#f59e0b',
    fontWeight: '600',
  },

  // Price Section  
  priceSection: {
    alignItems: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  premiumPrice: {
    color: '#6366f1',
    fontSize: 36,
    textShadowColor: 'rgba(99, 102, 241, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  goldenPrice: {
    color: '#d97706',
    fontSize: 36,
    textShadowColor: 'rgba(217, 119, 6, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  planPeriod: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  premiumPeriod: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  goldenPeriod: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savingsGradient: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savings: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  premiumSavings: {
    color: '#6366f1',
  },
  goldenSavings: {
    color: '#d97706',
  },

  // Description
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  premiumDescription: {
    color: '#6b7280',
    fontWeight: '500',
  },
  goldenDescription: {
    color: '#6b7280',
    fontWeight: '500',
  },

  // Features
  featuresSection: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  premiumFeatureText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  goldenFeatureText: {
    color: '#4b5563',
    fontWeight: '500',
  },

  // Action Button
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  outlineButtonGradient: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    opacity: 0.9,
  },
  primaryButton: {
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  goldenButton: {
    elevation: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  outlineButton: {
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Button Text
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  goldenButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineButtonText: {
    color: '#6B7280',
  },

  // Value Props
  valuePropsSection: {
    marginBottom: 32,
  },
  valuePropsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  valuePropsGrid: {
    gap: 24,
  },
  valueProp: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  valuePropIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valuePropTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  valuePropText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
export default SubscriptionController