#!/bin/bash
# SocialGenie Pro - Archive & Submit Workflow
# Prepares app for App Store submission

set -e

echo "📦 Preparing for App Store Archive..."

# Step 1: Clean build
echo "🧹 Cleaning previous builds..."
rm -rf ios/DerivedData 2>/dev/null || true

# Step 2: Build web app
echo "🔨 Building production web app..."
npm run build

# Step 3: Sync to iOS
echo "🔄 Syncing to iOS..."
npx cap sync ios

# Step 4: Open Xcode for archiving
echo "🛠️  Opening Xcode..."
open ios/App/App.xcodeproj

echo ""
echo "✅ Ready to archive!"
echo ""
echo "In Xcode:"
echo "1. Select 'Any iOS Device (arm64)' from device dropdown"
echo "2. Product → Clean Build Folder"
echo "3. Product → Archive"
echo "4. Distribute App → App Store Connect → Upload"
