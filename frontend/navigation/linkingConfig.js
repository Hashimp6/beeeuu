// navigation/linkingConfig.js
// Deep linking configuration for password reset and other screens
import { Linking } from 'react-native';

const linking = {
  prefixes: [
    'serchby://', // Keep original custom scheme
    'https://serchby.com', // Your new domain
    'https://www.serchby.com' // Your new domain with www
  ],
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: {
        path: 'reset-password/:token/:email',
        parse: {
          token: (token) => token,
          email: (email) => decodeURIComponent(email),
        },
      },
      // Store profile sharing
      StoreProfile: {
        path: 'store/:storeId',
        parse: {
          storeId: (storeId) => storeId,
        },
      },
      // Home screen
      Home: '',
      // Add other screens as needed
      // Profile: 'profile',
    },
  },
  // Optional: Handle initial URL when app is not running
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check if app was opened from a notification
    // You can add notification handling here if needed

    return null;
  },

  // Optional: Handle URL when app is already running
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);

    // Listen to incoming links when app is already open
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription?.remove();
    };
  },
};

export default linking;