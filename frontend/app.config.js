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
    icon: "./assets/icon.png",
    
    ios: {
      bundleIdentifier: "com.hashim.serchby",
      supportsTablet: true,
      icon: "./assets/icon.png",
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
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      permissions: [
        "NOTIFICATIONS",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
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
              scheme: "serchby"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    
    web: {
      favicon: "./assets/icon.png"
    },
    
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff"
        }
      ],
      [
        "@react-native-google-signin/google-signin"
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