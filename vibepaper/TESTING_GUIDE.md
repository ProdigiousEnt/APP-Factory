# VibePaper - Quick Testing Guide

## 🧪 Pre-Submission Testing Steps

### 1. Build and Run on Simulator

```bash
# Build the web assets
npm run build

# Sync with iOS
npx cap sync ios

# Run on iPhone simulator (for screenshots)
npx cap run ios --target="iPhone 17 Pro Max"

# Run on iPad simulator (for screenshots)
npx cap run ios --target="iPad Pro 11-inch (M5)"
```

### 2. Core Functionality Tests

#### Test 1: Basic Wallpaper Generation
1. Launch the app
2. Enter prompt: "Sunset over mountains with purple sky"
3. Select aspect ratio: 9:16
4. Select quality: 1K
5. Tap "Create Wallpapers"
6. ✅ Verify: Wallpaper generates and displays in gallery

#### Test 2: Photo Remix
1. Tap the photo upload button (camera icon)
2. Select a photo from the simulator's photo library
3. Enter prompt: "Neon forest aesthetic"
4. Tap "Create Wallpapers"
5. ✅ Verify: Generated wallpaper combines your photo with AI elements

#### Test 3: Free Limit & Paywall
1. Generate 3 wallpapers (use different prompts)
2. ✅ Verify: After 3rd generation, you should see paywall
3. ✅ Verify: "Go Pro" button appears in header

#### Test 4: Pro Features (Sandbox)
1. Tap "Go Pro" button
2. ✅ Verify: RevenueCat offerings load
3. ✅ Verify: Subscription options display correctly
4. (Optional) Test sandbox purchase

#### Test 5: Permissions
1. On first photo upload: ✅ Verify camera/photo library permission prompt appears
2. ✅ Verify permission description matches Info.plist text

### 3. UI/UX Checks

- [ ] App name displays as "VibePaper" (not "vibepaper")
- [ ] No "Nano Banana" or internal nicknames visible
- [ ] Placeholder text is instructional (shows examples)
- [ ] Loading states work smoothly
- [ ] Error messages are user-friendly
- [ ] Safe area padding looks correct (no content under notch)

### 4. Screenshot Capture Checklist

**iPhone 17 Pro Max (1242 × 2688):**
- [ ] Landing screen with prompt input
- [ ] Generation in progress (loading state)
- [ ] Beautiful generated wallpaper displayed
- [ ] Gallery view with multiple wallpapers
- [ ] Paywall screen

**iPad Pro 11" (1668 × 2420):**
- [ ] Same 5 screenshots as iPhone
- [ ] Verify dimensions with: `sips -g pixelWidth -g pixelHeight Screenshot.png`

### 5. Configuration Verification

```bash
# Check bundle ID matches
grep -A 1 "appId" capacitor.config.ts
# Should show: appId: 'com.prodigious.vibepaper'

# Verify Info.plist has permissions
grep -A 1 "NSCameraUsageDescription" ios/App/App/Info.plist
grep -A 1 "NSPhotoLibraryUsageDescription" ios/App/App/Info.plist
grep -A 1 "NSPhotoLibraryAddUsageDescription" ios/App/App/Info.plist
grep -A 1 "ITSAppUsesNonExemptEncryption" ios/App/App/Info.plist

# Check app icon exists
ls -lh ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png
```

### 6. Environment Variables Check

**IMPORTANT:** Verify these are set in `.env.local`:
- `VITE_GEMINI_API_KEY` - For AI generation
- `VITE_SUPABASE_URL` - For usage tracking
- `VITE_SUPABASE_ANON_KEY` - For database access
- `VITE_REVENUECAT_APPLE_KEY` - For subscriptions

### 7. Xcode Archive Process

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select "Any iOS Device (arm64)" from device dropdown
3. Product → Clean Build Folder (⇧⌘K)
4. Product → Archive (wait 2-5 minutes)
5. Distribute App → App Store Connect → Upload
6. Wait 10-30 minutes for processing

### 8. Common Issues & Quick Fixes

**Issue: "Signing for 'App' requires a development team"**
- Fix: Open Xcode, select target, Signing & Capabilities, select your team

**Issue: Camera doesn't work in simulator**
- Expected: Camera hardware not available in simulator
- Workaround: Test photo upload from library instead, or use physical device

**Issue: RevenueCat not initializing**
- Fix: Verify `VITE_REVENUECAT_APPLE_KEY` is set
- Fix: Check bundle ID matches RevenueCat dashboard

**Issue: Build fails with "detritus not allowed"**
- Fix: Must use Xcode IDE (not CLI) for projects in folders with spaces

### 9. Support Page Deployment

**Option 1: GitHub Pages (Recommended)**
```bash
# If you have a central APP-Factory repo
cd /path/to/APP-Factory
cp /Users/dennisharrington/Documents/IOS\ Apps/vibepaper/vibepaper_support.html vibepaper.html
git add vibepaper.html
git commit -m "Add VibePaper support page"
git push origin main

# URL will be: https://[username].github.io/APP-Factory/vibepaper.html
```

**Option 2: Create New Repo**
```bash
# Create new repo for support pages
gh repo create vibepaper-support --public
cd vibepaper-support
cp /Users/dennisharrington/Documents/IOS\ Apps/vibepaper/vibepaper_support.html index.html
git add index.html
git commit -m "Initial support page"
git push origin main

# Enable GitHub Pages in repo settings
# URL will be: https://[username].github.io/vibepaper-support
```

### 10. App Store Connect Metadata

**Copy-Paste Ready Content:**

**Promotional Text (170 chars):**
```
Transform your screen with AI-powered wallpapers. Describe your vibe, and watch stunning backgrounds come to life. Remix with your photos for unique results.
```

**Description (NO EMOJIS):**
```
VibePaper makes creating stunning wallpapers effortless.

Describe your desired vibe, and VibePaper generates high-quality, custom backgrounds using advanced AI. Remix results or combine with your own photos for truly unique wallpapers.

KEY FEATURES:
- AI-powered wallpaper generation
- Photo remix capability
- Instant preview and save
- Native iOS share integration
- Unlimited creations with Pro

PERFECT FOR:
- Personalizing your device
- Creating unique aesthetic backgrounds
- Matching wallpapers to your mood
- Exploring creative AI art

Make your screen uniquely yours.
```

**Keywords (100 chars):**
```
wallpaper,background,AI,generator,custom,photo,remix,aesthetic,vibe,personalize,screen,art
```

**Review Notes:**
```
TESTING INSTRUCTIONS:
The app provides 3 free wallpaper generations to demonstrate functionality.

Quick Test:
1. Launch the app
2. Enter a prompt (e.g., "Sunset over mountains with purple sky")
3. Wait for AI generation
4. View and save the wallpaper

After 3 uses, a paywall appears showing the Pro subscription option.
No login required - the app works immediately upon launch.

PRO FEATURES:
Test using Apple's Sandbox environment.
```

### 11. Final Checklist Before Submit

- [ ] App builds and runs without crashes
- [ ] All 3 free generations work
- [ ] Paywall appears correctly
- [ ] Screenshots captured and resized
- [ ] Support page deployed and accessible
- [ ] All App Store Connect metadata filled
- [ ] Privacy policy URL working
- [ ] Export compliance handled
- [ ] Age rating set to 4+
- [ ] Build uploaded and processed

---

## 🚀 Ready to Submit!

Once all items are checked, go to App Store Connect and click:
1. "Add for Review"
2. "Submit for Review"

**Expected Review Time:** 24-48 hours (best submission: Tuesday morning)

Good luck! 🎉
