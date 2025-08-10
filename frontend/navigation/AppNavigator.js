import React, { useEffect } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Import screens
import OtpVerificationScreen from '../screens/OtpScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import NewChatScreen from '../screens/NewChatScreen';
import HomeScreen from '../screens/HomeScreen';
import NewStore from '../screens/NewStoreScreen';
import SellerProfile from '../screens/StoreProfile';
import AppointmentScheduler from '../screens/SheduleScreen';
import ProductScreen from '../screens/StoreProduct';
import ProfileScreen from '../components/ProfileScreen';
import AppLayout from '../screens/AppLayout';
import StoreGallery from '../screens/StoreGallery';
import StoreSearchPage from '../screens/SearchStoreScreen';
import StoreAppointments from '../screens/StoreAppointment';
import { useNotification } from '../context/NotificationContext';
import OrderDetails from '../screens/OrderDataCollection';
import StoreOrders from '../screens/StoreOrders';
import UserAppointmentsOrders from '../screens/UserAppointmentAndOrders';
import LoginScreen from '../screens/login/LoginScreen';
import RegisterScreen from '../screens/login/RegisterScreen';
import ResetPasswordScreen from '../screens/login/ResetPasswordScreen';
import ForgotPasswordScreen from '../screens/login/ForgotPasswordScreen';
import StoreAdminScreen from '../screens/store/StoreHome';
import SettingsScreen from '../screens/SettingsScreen';
import StoreOffers from '../screens/store/ManageOfferScreen';
import AddOfferComponent from '../screens/store/AddOfferScreen';
import SubscriptionPlansScreen from '../components/Subscribtion';
import RazorpayCheckout from '../screens/store/RazorpayCheckout';
import CustomerBookingPage from '../screens/user/Reservation';
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { setupNotificationListeners, removeNotificationListeners } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Setup notification listeners when user is authenticated
      const listeners = setupNotificationListeners(navigation);
      
      // Cleanup listeners on unmount
      return () => {
        removeNotificationListeners();
      };
    }
  }, [user, navigation]);
  const isDarkMode = colorScheme === 'dark';
  
  // Show loading screen while checking authentication status
  if (authLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#121212' : '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
      </View>
    );
  }
  
  // Common screen options for consistent theming
  const screenOptions = {
    headerStyle: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      elevation: 0, // for Android
      shadowOpacity: 0, // for iOS
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0',
    },
    headerTintColor: isDarkMode ? '#FFFFFF' : '#121212',
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 18,
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        // Auth stack - Note the order and structure here
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
          name="ForgotPassword"
           component={ForgotPasswordScreen}
            options={{ headerShown: false }} />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          // Prevent going back to previous screen
          gestureEnabled: false,
        }}
      />
          <Stack.Screen
            name="otp"
            component={OtpVerificationScreen}
            options={{ 
              headerShown: false,
              // This prevents going back to Register screen
              gestureEnabled: false 
            }}
          />
        </>
      ) : (
        // Main app stack
        <>
            <Stack.Screen 
        name="Home"
        component={AppLayout}
        options={{ headerShown: false }}
        initialParams={{ initialTab: 'Offers' }}
      />
       <Stack.Screen 
        name="StoreAdmin"
        component={StoreAdminScreen}
        options={{ headerShown: false }}
        initialParams={{ initialTab: 'Home' }}
      />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatListScreen"
            component={ChatListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={{ headerShown: false }}
          />
            <Stack.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewStore"
            component={NewStore}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="StoreOffers"
            component={StoreOffers}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="NewOffer"
            component={AddOfferComponent}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="Booking"
            component={CustomerBookingPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
          <Stack.Screen name="RazorpayCheckout" component={RazorpayCheckout} />
          <Stack.Screen
            name="NewChat"
            component={NewChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SellerProfile"
            component={SellerProfile}
            options={{ headerShown: false }}
          />
              <Stack.Screen 
        name="profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
        initialParams={{ initialTab: 'Profile' }}
      />
          <Stack.Screen
            name="AppointmentScheduler"
            component={AppointmentScheduler}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="OrderDetails"
            component={OrderDetails}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UsersAppointments"
            component={UserAppointmentsOrders}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="storeProduct"
            component={ProductScreen}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="StoreAppointments"
            component={StoreAppointments}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="StoreOrders"
            component={StoreOrders}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="storeGallery"
            component={StoreGallery}
            options={{ headerShown: false }}
          />
            <Stack.Screen 
        name="Search"
        component={StoreSearchPage}
        options={{ headerShown: false }}
        initialParams={{ initialTab: 'Search' }}
      />
        </>
        
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;