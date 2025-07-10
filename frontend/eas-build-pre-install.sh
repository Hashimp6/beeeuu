#!/bin/bash

# This script runs before npm install during EAS builds

if [ "$EAS_BUILD" = "true" ] && [ ! -z "$GOOGLE_SERVICES_JSON_BASE64" ]; then
  echo "Creating google-services.json from base64..."
  echo "$GOOGLE_SERVICES_JSON_BASE64" | base64 -d > google-services.json
  
  # Also create in android/app directory if it exists
  if [ -d "android/app" ]; then
    echo "$GOOGLE_SERVICES_JSON_BASE64" | base64 -d > android/app/google-services.json
    echo "✅ google-services.json created in android/app directory"
  fi
  
  echo "✅ google-services.json created in root directory"
fi