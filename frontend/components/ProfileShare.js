import { Share, Alert, Platform } from 'react-native';

class ProfileShareHandler {
  /**
   * Share profile with customizable content
   * @param {Object} profileData - The profile data to share
   * @param {string} profileData.name - User's name
   * @param {string} profileData.bio - User's bio/description
   * @param {string} profileData.profileUrl - Deep link or web URL to profile
   * @param {string} profileData.imageUrl - Profile image URL (optional)
   * @param {Object} options - Additional share options
   */
  static async shareProfile(profileData, options = {}) {
    try {
      const {
        name = 'User',
        bio = '',
        profileUrl = '',
        imageUrl = ''
      } = profileData;

      const {
        customMessage = '',
        includeImage = false
      } = options;

      // Build share message
      let message = customMessage || `Check out ${name}'s profile!`;
      
      if (bio) {
        message += `\n\n"${bio}"`;
      }
      
      if (profileUrl) {
        message += `\n\nView profile: ${profileUrl}`;
      }

      const shareOptions = {
        message: message,
        title: `${name}'s Profile`,
      };

      // Add URL for better sharing on some platforms
      if (profileUrl) {
        shareOptions.url = profileUrl;
      }

      // For iOS, we can include the image URL in the message
      if (Platform.OS === 'ios' && includeImage && imageUrl) {
        shareOptions.url = imageUrl;
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
        'Sorry, we couldn\'t share your profile right now. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate a deep link URL for the profile
   * @param {string} userId - User's unique ID
   * @param {string} appScheme - Your app's URL scheme (e.g., 'myapp')
   * @returns {string} Deep link URL
   */
  static generateProfileDeepLink(userId, appScheme = 'yourapp') {
    return `${appScheme}://store/${userId}`;
  }

  /**
   * Generate a web URL for the profile (if you have a web version)
   * @param {string} userId - User's unique ID
   * @param {string} baseUrl - Your web app's base URL
   * @returns {string} Web URL
   */
  static generateProfileWebLink(userId, baseUrl = 'https://yourapp.com') {
    return `${baseUrl}/profile/${userId}`;
  }

  /**
   * Quick share with minimal setup
   * @param {string} userName - User's name
   * @param {string} userId - User's ID for generating links
   */
  static async quickShare(userName, userId) {
    const profileUrl = this.generateProfileDeepLink(userId);
    
    await this.shareProfile({
      name: userName,
      profileUrl: profileUrl
    });
  }
}

export default ProfileShareHandler;