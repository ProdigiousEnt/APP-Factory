#!/bin/bash
# Sync Legal Docs to GitHub Pages
# Usage: ./sync-legal-docs.sh [app-name]
# Example: ./sync-legal-docs.sh splitsmart

APP_NAME=$1

if [ -z "$APP_NAME" ]; then
  echo "Usage: ./sync-legal-docs.sh [app-name]"
  echo "Example: ./sync-legal-docs.sh splitsmart"
  exit 1
fi

echo "📄 Syncing $APP_NAME legal docs to GitHub Pages..."

# Check if docs exist
if [ ! -d "docs/$APP_NAME" ]; then
  echo "❌ Error: docs/$APP_NAME not found"
  exit 1
fi

# Add and commit docs
git add docs/$APP_NAME/
git commit -m "Update $APP_NAME legal documentation"

# Push to both remotes
echo "⬆️  Pushing to private repo..."
git push private main

echo "⬆️  Pushing to public GitHub Pages..."
git push origin main

echo "✅ Done! Legal docs will be live in 1-2 minutes at:"
echo "   https://prodigiousent.github.io/APP-Factory/docs/$APP_NAME/"
