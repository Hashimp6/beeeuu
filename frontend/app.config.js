import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const isEASBuild = process.env.EAS_BUILD === 'true';

if ((isEASBuild || process.env.GOOGLE_SERVICES_JSON_BASE64) && !existsSync(join('android', 'app', 'google-services.json'))) {
  try {
    const googleServicesJson = Buffer.from(
      process.env.GOOGLE_SERVICES_JSON_BASE64,
      'base64'
    ).toString('utf8');

    const filePath = join(process.cwd(), 'android', 'app', 'google-services.json');
    const dirPath = dirname(filePath);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    JSON.parse(googleServicesJson); // ✅ Validate
    writeFileSync(filePath, googleServicesJson);

    console.log('✅ google-services.json created successfully');
  } catch (error) {
    console.error('❌ Failed to write google-services.json:', error.message);
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
    scheme: "beeu",
    icon: "./assets/logo.png", // Main app icon
    
    ios: {
      bundleIdentifier: "com.hashim.beeuu",
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
      package: "com.hashim.beeuu",
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
        projectId: "02f51a23-2820-4320-a2b6-3a62255abb20"
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
};