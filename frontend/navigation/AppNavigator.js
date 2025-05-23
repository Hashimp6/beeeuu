import React from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
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

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
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
            name="NewStore"
            component={NewStore}
            options={{ headerShown: false }}
          />
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
            name="AppointmentCalendar"
            component={AppointmentScheduler}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="storeProduct"
            component={ProductScreen}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="storeGallery"
            component={StoreGallery}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;