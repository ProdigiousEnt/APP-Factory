#!/bin/bash
echo "📱 Resizing screenshots to 1290x2796..."
mkdir -p ~/Desktop/AppStore_Screenshots_Resized
count=0
for file in ~/Desktop/Simulator\ Screenshot*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        output="$HOME/Desktop/AppStore_Screenshots_Resized/$filename"
        sips -z 2796 1290 "$file" --out "$output" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Resized: $filename"
            ((count++))
        fi
    fi
done
echo "✅ Done! Resized $count screenshots"
echo "📁 Check: ~/Desktop/AppStore_Screenshots_Resized/"
