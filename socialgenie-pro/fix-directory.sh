#!/bin/bash
# Directory Rename Script
# This will move "IOS Apps" to "ios-apps" to fix path space issues

echo "🔧 Fixing directory name..."
echo ""
echo "This will rename:"
echo "  FROM: ~/Documents/IOS Apps/"
echo "  TO:   ~/Documents/ios-apps/"
echo ""

# Close Xcode if running
echo "Closing Xcode..."
killall Xcode 2>/dev/null || true
sleep 2

# Move the directory
echo "Moving directory..."
mv ~/Documents/IOS\ Apps ~/Documents/ios-apps

echo ""
echo "✅ Done! Your apps are now at:"
echo "   ~/Documents/ios-apps/"
echo ""
echo "Next steps:"
echo "1. Update your editor workspace to point to new location"
echo "2. Run: cd ~/Documents/ios-apps/socialgenie-pro"
echo "3. Run: ./dev-workflow.sh"
