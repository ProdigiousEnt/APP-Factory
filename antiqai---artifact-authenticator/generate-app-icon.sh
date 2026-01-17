#!/bin/bash

# AntiqueAI App Icon Generator
# Generates all required iOS app icon sizes from the 1024x1024 source

SOURCE_ICON="app-icon-1024.png"
OUTPUT_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🎨 Generating AntiqueAI app icons..."

# Generate 1024x1024 (App Store)
cp "$SOURCE_ICON" "$OUTPUT_DIR/AppIcon-1024.png"
echo "✅ Generated 1024x1024 (App Store)"

# Generate all required sizes for iOS
# iPhone sizes
sips -z 180 180 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-60@3x.png"
sips -z 120 120 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-60@2x.png"
sips -z 87 87 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-29@3x.png"
sips -z 58 58 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-29@2x.png"
sips -z 80 80 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-40@2x.png"
sips -z 120 120 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-40@3x.png"

# iPad sizes
sips -z 152 152 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-76@2x.png"
sips -z 76 76 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-76.png"
sips -z 167 167 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-83.5@2x.png"

# Settings/Spotlight
sips -z 40 40 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-20@2x.png"
sips -z 60 60 "$SOURCE_ICON" --out "$OUTPUT_DIR/AppIcon-20@3x.png"

echo "✅ Generated all icon sizes"

# Create Contents.json
cat > "$OUTPUT_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "AppIcon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-20@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-29@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-40@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-76.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "76x76"
    },
    {
      "filename" : "AppIcon-76@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76"
    },
    {
      "filename" : "AppIcon-83.5@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5"
    },
    {
      "filename" : "AppIcon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ Created Contents.json"
echo "🎉 App icon generation complete!"
echo "📁 Icons saved to: $OUTPUT_DIR"
