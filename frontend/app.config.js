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
    // ✅ Fixed icon path (assuming it should be logo.png)
    icon: "./assets/log.png",

    ios: {
      bundleIdentifier: "com.hashim.beeuu",
      supportsTablet: true,
      // ✅ Add specific iOS icon if needed
      icon: "./assets/log.png",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      associatedDomains: [
        "applinks:beeu.com",
        "applinks:www.beeu.com"
      ]
    },
    android: {
      package: "com.hashim.beeuu",
      googleServicesFile: "./android/app/google-services.json",
      // ✅ Fixed adaptive icon with foreground image
      adaptiveIcon: {
        foregroundImage: "./assets/log.png",
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
              host: "beeu.com"
            },
            {
              scheme: "https",
              host: "www.beeu.com"
            },
            {
              scheme: "beeu"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    plugins: [
      [
        "expo-notifications",
        {
          // ✅ Fixed notification icon path
          icon: "./assets/log.png",
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