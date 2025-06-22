#!/bin/bash

echo "Restoring google-services.json from EAS environment variable..."
echo $GOOGLE_SERVICES_JSON | base64 -d > android/app/google-services.json
