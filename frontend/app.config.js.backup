// import 'dotenv/config';

export default {
  expo: {
    name: "beeu",
    slug: "beeu",
    version: "1.0.0",
    owner: "hashimp6",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      package: "com.hashim.beeuu",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      permissions: ["NOTIFICATIONS"]
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/log.png",
          color: "#ffffff",
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "02f51a23-2820-4320-a2b6-3a62255abb20"
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
};
