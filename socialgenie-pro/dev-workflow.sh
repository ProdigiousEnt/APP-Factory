#!/bin/bash
# SocialGenie Pro - Development Workflow Script
# This script automates the build, sync, and Xcode launch process

set -e  # Exit on error

echo "🚀 Starting SocialGenie Pro Development Workflow..."

# Step 1: Build web app
echo "📦 Building web app..."
npm run build

# Step 2: Sync to iOS
echo "🔄 Syncing to iOS..."
npx cap sync ios

# Step 3: Open in Xcode
echo "🛠️  Opening Xcode..."
open ios/App/App.xcodeproj

echo "✅ Workflow complete! Xcode is opening..."
echo ""
echo "Next steps:"
echo "1. Wait for Xcode to load"
echo "2. Select your simulator/device"
echo "3. Click the Play button (▶) to run"
