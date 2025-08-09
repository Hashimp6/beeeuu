// services/writeGoogleJson.js
import fs from "fs";
import path from "path";

const base64 = process.env.GOOGLE_SERVICES_JSON_BASE64;

if (!base64) {
  console.error("❌ Missing GOOGLE_SERVICES_JSON_BASE64 in env");
  process.exit(1);
}

const filePath = path.resolve(__dirname, "../android/app/google-services.json");

try {
  const json = Buffer.from(base64, "base64").toString("utf-8");
  fs.writeFileSync(filePath, json);

} catch (error) {
  console.error("❌ Failed to write google-services.json", error);
  process.exit(1);
}
