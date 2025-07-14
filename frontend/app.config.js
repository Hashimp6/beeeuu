import 'dotenv/config';
// Don't import writeGoogleJson during prebuild
// import './services/writeGoogleJson';

export default {
  expo: {
    name: "SerchBy",
    slug: "SerchBy",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    // Remove newArchEnabled temporarily
    // newArchEnabled: true,
    scheme: "serchby",
    icon: "./assets/icon.png",
    
    ios: {
      bundleIdentifier: "com.hashim.serchby",
      supportsTablet: true,
      icon: "./assets/icon.png",
      config: {
        googleMapsApiKey:"AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24"
      },
      associatedDomains: [
        "applinks:serchby.com",
        "applinks:www.serchby.com"
      ]
    },
    
    android: {
      package: "com.hashim.serchby",
      icon: "./assets/icon.png",
      googleServicesFile: "./android/app/google-services.json",

      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
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
      ]
    ],

    extra: {
      eas: {
        projectId: "d0bc2648-7a28-4941-8575-dcfa83f9fd52"
      }
    }
  }
};