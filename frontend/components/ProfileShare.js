// utils/ProfileShareHandler.js
import { Share, Alert, Platform, Linking } from 'react-native';

class ProfileShareHandler {
  /**
   * Share profile with customizable content
   * @param {Object} profileData - The profile data to share
   * @param {string} profileData.name - User's name
   * @param {string} profileData.bio - User's bio/description
   * @param {string} profileData.profileUrl - Deep link or web URL to profile
   * @param {string} profileData.webUrl - Web URL to profile (fallback)
   * @param {string} profileData.imageUrl - Profile image URL (optional)
   * @param {Object} options - Additional share options
   */
  static async shareProfile(profileData, options = {}) {
    try {
      const {
        name = 'User',
        bio = '',
        profileUrl = '',
        webUrl = '',
        imageUrl = ''
      } = profileData;

      const {
        customMessage = '',
        includeImage = false,
        preferWebUrl = false
      } = options;

      // Build share message
      let message = customMessage || `Check out ${name}'s profile on SerchBy!`;
      
      if (bio) {
        message += `\n\n"${bio}"`;
      }
      
      // Use web URL if preferred or if no deep link available
      const shareUrl = preferWebUrl ? (webUrl || profileUrl) : (profileUrl || webUrl);
      
      if (shareUrl) {
        message += `\n\nView profile: ${shareUrl}`;
      }

      const shareOptions = {
        message: message,
        title: `${name}'s Profile - SerchBy`,
      };

      // Add URL for better sharing on platforms that support it
      if (shareUrl) {
        shareOptions.url = shareUrl;
      }

      // For iOS, handle image sharing differently
      if (Platform.OS === 'ios' && includeImage && imageUrl) {
        try {
          // Check if image URL is accessible
          const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
          if (imageResponse.ok) {
            shareOptions.url = imageUrl;
          }
        } catch (error) {
          console.warn('Image URL not accessible for sharing:', error);
        }
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via specific activity type (iOS)
          console.log('Profile shared via:', result.activityType);
        } else {
          // Shared successfully
          console.log('Profile shared successfully');
        }
        return { success: true, activityType: result.activityType };
      } else if (result.action === Share.dismissedAction) {
        // Share dialog was dismissed
        console.log('Share dialog dismissed');
        return { success: false, dismissed: true };
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert(
        'Share Failed',
        'Sorry, we couldn\'t share this profile right now. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate a deep link URL for the store profile
   * @param {string} storeId - Store's unique ID
   * @param {string} appScheme - Your app's URL scheme
   * @returns {string} Deep link URL
   */
  static generateProfileDeepLink(storeId, appScheme = 'serchby') {
    if (!storeId) {
      console.warn('Store ID is required for deep link generation');
      return '';
    }
    return `${appScheme}://store/${storeId}`;
  }

  /**
   * Generate a web URL for the store profile
   * @param {string} storeId - Store's unique ID  
   * @param {string} baseUrl - Your web app's base URL
   * @returns {string} Web URL
   */
  static generateProfileWebLink(storeId, baseUrl = 'https://www.serchby.com') {
    if (!storeId) {
      console.warn('Store ID is required for web link generation');
      return '';
    }
    return `${baseUrl}/storeprofile/${storeId}`;
  }

  /**
   * Check if the app can handle deep links
   * @param {string} url - Deep link URL to check
   * @returns {Promise<boolean>} Whether the URL can be opened
   */
  static async canOpenDeepLink(url) {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.warn('Error checking deep link capability:', error);
      return false;
    }
  }

  /**
   * Quick share with minimal setup
   * @param {string} storeName - Store's name
   * @param {string} storeId - Store's ID for generating links
   * @param {Object} options - Additional options
   */
  static async quickShare(storeName, storeId, options = {}) {
    if (!storeId) {
      Alert.alert('Error', 'Store ID is required for sharing');
      return { success: false, error: 'Store ID missing' };
    }

    const deepLink = this.generateProfileDeepLink(storeId);
    const webLink = this.generateProfileWebLink(storeId);
    
    const profileData = {
      name: storeName || 'Store',
      profileUrl: deepLink,
      webUrl: webLink
    };

    const shareOptions = {
      customMessage: `Hey! Check out ${storeName}'s store on SerchBy!`,
      preferWebUrl: options.preferWebUrl || false,
      ...options
    };

    return await this.shareProfile(profileData, shareOptions);
  }

  /**
   * Share store with full details
   * @param {Object} store - Complete store object
   * @param {Object} options - Additional share options
   */
  static async shareStore(store, options = {}) {
    if (!store || !store._id) {
      Alert.alert('Error', 'Store information is incomplete');
      return { success: false, error: 'Store data missing' };
    }

    const deepLink = this.generateProfileDeepLink(store._id);
    const webLink = this.generateProfileWebLink(store._id);
    
    const profileData = {
      name: store.storeName || store.name || 'Store',
      bio: store.description || `${store.category || 'Local'} store${store.place ? ` in ${store.place}` : ''}`,
      profileUrl: deepLink,
      webUrl: webLink,
      imageUrl: store.profileImage || store.image || ''
    };

    const shareOptions = {
      customMessage: `Hey! Check out ${store.storeName || store.name}'s store on SerchBy!`,
      includeImage: !!(store.profileImage || store.image),
      preferWebUrl: options.preferWebUrl || false,
      ...options
    };

    return await this.shareProfile(profileData, shareOptions);
  }

  /**
   * Share current user's own profile
   * @param {Object} userProfile - User's profile data
   * @param {Object} options - Additional share options
   */
  static async shareMyProfile(userProfile, options = {}) {
    if (!userProfile || !userProfile._id) {
      Alert.alert('Error', 'Profile information is incomplete');
      return { success: false, error: 'Profile data missing' };
    }

    const deepLink = this.generateProfileDeepLink(userProfile._id);
    const webLink = this.generateProfileWebLink(userProfile._id);
    
    const profileData = {
      name: userProfile.name || userProfile.storeName || 'My Store',
      bio: userProfile.bio || userProfile.description || 'Check out my store on SerchBy!',
      profileUrl: deepLink,
      webUrl: webLink,
      imageUrl: userProfile.profileImage || userProfile.image || ''
    };

    const shareOptions = {
      customMessage: options.customMessage || `Check out my store on SerchBy!`,
      includeImage: !!(userProfile.profileImage || userProfile.image),
      preferWebUrl: options.preferWebUrl || false,
      ...options
    };

    return await this.shareProfile(profileData, shareOptions);
  }

  /**
   * Get the best URL for sharing based on platform and preferences
   * @param {string} storeId - Store's unique ID
   * @param {Object} options - Options for URL generation
   * @returns {string} Best URL for sharing
   */
  static getBestShareUrl(storeId, options = {}) {
    const { preferWebUrl = false, forceWebUrl = false } = options;
    
    if (forceWebUrl || preferWebUrl) {
      return this.generateProfileWebLink(storeId);
    }
    
    // For mobile platforms, prefer deep links
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return this.generateProfileDeepLink(storeId);
    }
    
    // For web or unknown platforms, use web URL
    return this.generateProfileWebLink(storeId);
  }
}

export default ProfileShareHandler;