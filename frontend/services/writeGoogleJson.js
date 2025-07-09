require('dotenv').config(); 
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

const isEASBuild = process.env.EAS_BUILD === 'true';

if ((isEASBuild || process.env.GOOGLE_SERVICES_JSON_BASE64) && process.env.GOOGLE_SERVICES_JSON_BASE64) {
  try {
    const googleServicesJson = Buffer.from(
      process.env.GOOGLE_SERVICES_JSON_BASE64,
      'base64'
    ).toString('utf8');

    // Create in root directory first
    const rootFilePath = join(process.cwd(), 'google-services.json');
    
    // Also create in android/app directory if it exists
    const androidFilePath = join(process.cwd(), 'android', 'app', 'google-services.json');
    const androidDirPath = dirname(androidFilePath);

    // Validate JSON before writing
    const parsedJson = JSON.parse(googleServicesJson);
    
    // Write to root directory
    writeFileSync(rootFilePath, googleServicesJson);
    console.log('✅ google-services.json created in root directory');

    // Write to android directory (create if it doesn't exist)
    if (!existsSync(androidDirPath)) {
      mkdirSync(androidDirPath, { recursive: true });
    }
    writeFileSync(androidFilePath, googleServicesJson);
    console.log('✅ google-services.json created in android/app directory');

  } catch (error) {
    console.error('❌ Failed to write google-services.json:', error.message);
  }
}