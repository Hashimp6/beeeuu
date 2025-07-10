require('dotenv').config();

const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

// Only run during EAS builds, not during prebuild
const isEASBuild = process.env.EAS_BUILD === 'true';
const isPrebuild = process.env.EXPO_PREBUILD === 'true';

if (isEASBuild && !isPrebuild && process.env.GOOGLE_SERVICES_JSON_BASE64) {
  try {
    const googleServicesJson = Buffer.from(
      process.env.GOOGLE_SERVICES_JSON_BASE64,
      'base64'
    ).toString('utf8');

    // Validate JSON before writing
    const parsedJson = JSON.parse(googleServicesJson);

    // Create in root directory first
    const rootFilePath = join(process.cwd(), 'google-services.json');
    writeFileSync(rootFilePath, googleServicesJson);
    console.log('✅ google-services.json created in root directory');

    // Also create in android/app directory if it exists
    const androidFilePath = join(process.cwd(), 'android', 'app', 'google-services.json');
    const androidDirPath = dirname(androidFilePath);

    if (!existsSync(androidDirPath)) {
      mkdirSync(androidDirPath, { recursive: true });
    }
    writeFileSync(androidFilePath, googleServicesJson);
    console.log('✅ google-services.json created in android/app directory');

  } catch (error) {
    console.error('❌ Failed to write google-services.json:', error.message);
  }
}