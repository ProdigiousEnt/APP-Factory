#!/bin/bash

# SplitSmart App Icon Generator
# Generates all required iOS app icon sizes from the master 1024x1024 icon

SOURCE_ICON="/Users/dennisharrington/.gemini/antigravity/brain/aba9b276-eeaf-4ccb-b2ad-a2b6bfb43008/splitsmart_app_icon_1767792707575.png"
OUTPUT_DIR="/Users/dennisharrington/Documents/IOS Apps/splitsmart/ios/App/App/Assets.xcassets/AppIcon.appiconset"

echo "🎨 Generating SplitSmart app icons..."
echo "Source: $SOURCE_ICON"
echo "Output: $OUTPUT_DIR"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Function to generate icon
generate_icon() {
  local name=$1
  local size=$2
  local output_file="$OUTPUT_DIR/icon-${name}.png"
  
  echo "Generating ${name} (${size}x${size})..."
  sips -z "$size" "$size" "$SOURCE_ICON" --out "$output_file" > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Created: icon-${name}.png"
  else
    echo "❌ Failed: icon-${name}.png"
  fi
}

# Generate all required sizes
generate_icon "20x20" "20"
generate_icon "20x20@2x" "40"
generate_icon "20x20@3x" "60"
generate_icon "29x29" "29"
generate_icon "29x29@2x" "58"
generate_icon "29x29@3x" "87"
generate_icon "40x40" "40"
generate_icon "40x40@2x" "80"
generate_icon "40x40@3x" "120"
generate_icon "60x60@2x" "120"
generate_icon "60x60@3x" "180"
generate_icon "76x76" "76"
generate_icon "76x76@2x" "152"
generate_icon "83.5x83.5@2x" "167"
generate_icon "1024x1024" "1024"

echo ""
echo "✨ Icon generation complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Navigate to App > Assets.xcassets > AppIcon"
echo "3. Verify all icon sizes are present"
echo "4. Build and test on simulator"
