const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

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

    JSON.parse(googleServicesJson);
    writeFileSync(filePath, googleServicesJson);

    console.log('✅ google-services.json created successfully');
  } catch (error) {
    console.error('❌ Failed to write google-services.json:', error.message);
  }
}
