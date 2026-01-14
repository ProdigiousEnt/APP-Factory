#!/bin/bash
# Create Legal Docs for New App
# Usage: ./create-legal-docs.sh [new-app-name] [display-name]
# Example: ./create-legal-docs.sh memegenius "MemeGenius"

APP_SLUG=$1
APP_NAME=$2

if [ -z "$APP_SLUG" ] || [ -z "$APP_NAME" ]; then
  echo "Usage: ./create-legal-docs.sh [app-slug] [display-name]"
  echo "Example: ./create-legal-docs.sh memegenius \"MemeGenius\""
  exit 1
fi

echo "📁 Creating legal docs for $APP_NAME..."

# Create folder
mkdir -p "docs/$APP_SLUG"

# Copy templates from SplitSmart
cp "docs/splitsmart/privacy-policy.html" "docs/$APP_SLUG/"
cp "docs/splitsmart/support.html" "docs/$APP_SLUG/"

# Replace app name in files
sed -i '' "s/SplitSmart/$APP_NAME/g" "docs/$APP_SLUG/privacy-policy.html"
sed -i '' "s/SplitSmart/$APP_NAME/g" "docs/$APP_SLUG/support.html"
sed -i '' "s/splitsmart/$APP_SLUG/g" "docs/$APP_SLUG/privacy-policy.html"
sed -i '' "s/splitsmart/$APP_SLUG/g" "docs/$APP_SLUG/support.html"

echo "✅ Created docs in: docs/$APP_SLUG/"
echo ""
echo "📝 Next steps:"
echo "1. Edit docs/$APP_SLUG/privacy-policy.html (update app description)"
echo "2. Edit docs/$APP_SLUG/support.html (update features/how-to)"
echo "3. Run: ./sync-legal-docs.sh $APP_SLUG"
echo ""
echo "URLs will be:"
echo "  https://prodigiousent.github.io/APP-Factory/docs/$APP_SLUG/privacy-policy.html"
echo "  https://prodigiousent.github.io/APP-Factory/docs/$APP_SLUG/support.html"
