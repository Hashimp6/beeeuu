import 'dotenv/config';

const isUsingDynamicGoogleServices = !!process.env.GOOGLE_SERVICES_JSON_BASE64;

export default {
  expo: {
    name: "SerchBy",
    slug: "SerchBy", 
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: "serchby",
    icon: "./assets/icon.png",

    ios: {
      bundleIdentifier: "com.hashim.serchby",
      supportsTablet: true,
      icon: "./assets/icon.png",
      config: {
        googleMapsApiKey: "AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24"
      },
      associatedDomains: [
        "applinks:serchby.com",
        "applinks:www.serchby.com"
      ]
    },

    android: {
      package: "com.hashim.serchby",
      icon: "./assets/icon.png",
      googleServicesFile: isUsingDynamicGoogleServices
        ? "./android/app/google-services.json"
        : undefined,
      
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      
      // Add this for notification icon
      notifications: {
        icon: "./assets/icon.png",
        color: "#ffffff"
      },
      
      config: {
        googleMaps: {
          apiKey: "AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24"
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
            { scheme: "https", host: "serchby.com" },
            { scheme: "https", host: "www.serchby.com" },
            { scheme: "serchby" }
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
          color: "#ffffff",
          // Add this for more control
          sounds: ["./assets/notification.wav"], // optional custom sound
          androidMode: "default",
          androidCollapsedTitle: "#{unread_notifications} new interactions"
        }
      ]
    ],

    extra: {
      googleMapsApiKey: "AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24",
      eas: {
        projectId: "d0bc2648-7a28-4941-8575-dcfa83f9fd52"
      }
    }
  }
};