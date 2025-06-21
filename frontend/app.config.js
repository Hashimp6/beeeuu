// import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Create google-services.json from environment variable during EAS build
if (process.env.EAS_BUILD && process.env.GOOGLE_SERVICES_JSON) {
  try {
    const googleServicesJson = Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64').toString('utf8');
    const filePath = join(process.cwd(), 'google-services.json');
    
    // Validate it's valid JSON
    JSON.parse(googleServicesJson);
    
    writeFileSync(filePath, googleServicesJson);
    console.log('✅ google-services.json created successfully from environment variable');
  } catch (error) {
    console.error('❌ Error creating google-services.json:', error.message);
    throw error;
  }
}

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
      googleServicesFile: "./google-services.json",
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
