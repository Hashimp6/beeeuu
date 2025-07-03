import 'dotenv/config';
import './services/writeGoogleJson';

export default {
  expo: {
    name: "SerchBy",
    slug: "SerchBy",
    version: "1.0.0",
    owner: "hashimp6",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "serchby",
    icon: "./assets/logo.png", // Main app icon
    
    ios: {
      bundleIdentifier: "com.hashim.serchby",
      supportsTablet: true,
      icon: "./assets/logo.png", // iOS specific icon (should be same as main)
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      associatedDomains: [
        "applinks:serchby.com",
        "applinks:www.serchby.com"
      ]
    },
    
    android: {
      package: "com.hashim.serchby",
      googleServicesFile: "./android/app/google-services.json",
      icon: "./assets/logo.png", // Android specific icon
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png", // Fixed typo: was "log.png"
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      permissions: ["NOTIFICATIONS"],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "serchby.com"
            },
            {
              scheme: "https",
              host: "www.serchby.com"
            },
            {
              scheme: "beeu"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    
    web: {
      favicon: "./assets/logo.png" // Web favicon
    },
    
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/logo.png", // Fixed: was "log.png"
          color: "#ffffff"
        }
      ]
    ],
    
    extra: {
      eas: {
        projectId: "6b962b7b-711f-49d3-9550-bfa7f33a296f"
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
};