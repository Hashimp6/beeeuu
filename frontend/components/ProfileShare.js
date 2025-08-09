import { Share, Linking, Alert, Clipboard } from 'react-native';

class ProfileShareHandler {
  // Helper to sanitize store name for URLs (e.g., replace spaces with hyphens)
  static sanitizeStoreName(name) {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // replace spaces with -
      .replace(/[^a-z0-9\-]/g, ''); // remove special characters
  }

  // Generate clean URL
  static generateShareUrl(store) {
    const sanitizedName = this.sanitizeStoreName(store.storeName || store.name);
    return `https://www.serchby.com/storeprofile/${sanitizedName}`;
  }

  // Generate message for sharing
  static generateShareMessage(store) {
    const shareUrl = this.generateShareUrl(store);
    return `Hey! Check out ${store.storeName || store.name}'s store on SerchBy!\n\n"${store.description || store.category || 'Amazing products and services'}"\n\nView profile: ${shareUrl}`;
  }

  // Share using native share dialog
  static async shareStore(store) {
    try {
      const shareUrl = this.generateShareUrl(store);
      const message = this.generateShareMessage(store);

      const result = await Share.share({
        message,
        title: `${store.storeName || store.name} - Store Profile`,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:');
        } else {
          console.log('Store profile shared successfully');
        }
        return { success: true, dismissed: false };
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dialog dismissed');
        return { success: false, dismissed: true };
      }
    } catch (error) {
      console.error('Error sharing store profile:', error);
      Alert.alert('Error', 'Failed to share store profile');
      return { success: false, dismissed: false, error: error.message };
    }
  }

  // Share via WhatsApp
  static async shareViaWhatsApp(store) {
    try {
      const message = this.generateShareMessage(store);
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

  // Copy link to clipboard
  static async copyStoreLink(store) {
    try {
      const shareUrl = this.generateShareUrl(store);
      await Clipboard.setString(shareUrl);
      Alert.alert('Success', 'Store profile link copied to clipboard!');
      return { success: true };
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
      return { success: false, error: error.message };
    }
  }

  // Simulate Instagram share (copy + alert)
  static async shareViaInstagram(store) {
    try {
      const shareUrl = this.generateShareUrl(store);
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
            },
          },
        ]
      );

      return { success: true };
    } catch (error) {
      console.error('Error sharing via Instagram:', error);
      Alert.alert('Error', 'Failed to prepare Instagram share');
      return { success: false, error: error.message };
    }
  }
}

export default ProfileShareHandler;
