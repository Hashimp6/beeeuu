import { Share, Linking, Alert, Clipboard } from 'react-native';

class ProfileShareHandler {
  static async shareStore(store) {
    try {
      // Create the share URL and message
      const shareUrl = `https://www.serchby.com/storeprofile/${store.storeName || store.name}`;
      const message = `Hey! Check out ${store.storeName || store.name}'s store on SerchBy!\n\n"${store.description || store.category || 'Amazing products and services'}"\n\nView profile: ${shareUrl}`;
      
      // Use React Native's built-in Share API
      const result = await Share.share({
        message: message,
        title: `${store.storeName || store.name} - Store Profile`,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Store profile shared successfully');
        }
        return { success: true, dismissed: false };
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dialog dismissed');
        return { success: false, dismissed: true };
      }
    } catch (error) {
      console.error('Error sharing store profile:', error);
      Alert.alert('Error', 'Failed to share store profile');
      return { success: false, dismissed: false, error: error.message };
    }
  }

  static async shareViaWhatsApp(store) {
    try {
      const shareUrl = `https://www.serchby.com/storeprofile/${store.storeName || store.name}`;
      const message = `Hey! Check out ${store.storeName || store.name}'s store on SerchBy!\n\n"${store.description || store.category || 'Amazing products and services'}"\n\nView profile: ${shareUrl}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        return { success: true };
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
        return { success: false, error: 'WhatsApp not installed' };
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert('Error', 'Failed to share via WhatsApp');
      return { success: false, error: error.message };
    }
  }

  static async copyStoreLink(store) {
    try {
      const shareUrl = `https://www.serchby.com/storeprofile/${store.storeName || store.name}`;
      await Clipboard.setString(shareUrl);
      Alert.alert('Success', 'Store profile link copied to clipboard!');
      return { success: true };
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
      return { success: false, error: error.message };
    }
  }

  static async shareViaInstagram(store) {
    try {
      // Instagram doesn't support direct URL sharing
      // Copy the link and show instructions
      const shareUrl = `https://www.serchby.com/storeprofile/${store.storeName || store.name}`;
      await Clipboard.setString(shareUrl);
      
      Alert.alert(
        'Instagram Share',
        'Store profile link copied to clipboard! You can now paste it in your Instagram story or post.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Instagram', 
            onPress: async () => {
              try {
                const instagramUrl = 'instagram://';
                const supported = await Linking.canOpenURL(instagramUrl);
                if (supported) {
                  await Linking.openURL(instagramUrl);
                } else {
                  await Linking.openURL('https://www.instagram.com/');
                }
              } catch (error) {
                console.error('Failed to open Instagram:', error);
              }
            }
          }
        ]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error sharing via Instagram:', error);
      Alert.alert('Error', 'Failed to prepare Instagram share');
      return { success: false, error: error.message };
    }
  }

  static generateShareUrl(store) {
    return `https://www.serchby.com/storeprofile/${store.storeName || store.name}`;
  }

  static generateShareMessage(store) {
    const shareUrl = this.generateShareUrl(store);
    return `Hey! Check out ${store.storeName || store.name}'s store on SerchBy!\n\n"${store.description || store.category || 'Amazing products and services'}"\n\nView profile: ${shareUrl}`;
  }
}

export default ProfileShareHandler;