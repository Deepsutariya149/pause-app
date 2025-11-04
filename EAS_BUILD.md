# EAS Build Guide - Standalone App Installation

## Understanding EAS Build Types

### 🚀 Standalone Apps (Preview & Production)
These builds create **native apps** that install directly on devices - **NO Expo Go required**.

- **Preview Build**: For testing/internal distribution
  - iOS: Creates `.ipa` file (install via TestFlight or directly)
  - Android: Creates `.apk` file (install directly on Android devices)
  
- **Production Build**: For App Store/Play Store
  - iOS: Creates `.ipa` for App Store submission
  - Android: Creates `.aab` (App Bundle) for Play Store

### 🔧 Development Build (Optional)
Creates a custom development client - still requires the Expo Dev Client app, but allows native modules.

## Building Standalone Apps

### 1. Preview Build (Recommended for Testing)

```bash
# Android APK - direct install
eas build --profile preview --platform android

# iOS IPA - for TestFlight or direct install
eas build --profile preview --platform ios
```

After build completes:
- **Android**: Download `.apk` and install directly on device
- **iOS**: Use `.ipa` with TestFlight or install via Xcode

### 2. Production Build (App Stores)

```bash
# Both platforms
eas build --profile production --platform all

# Individual platforms
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Installation After Build

### Android (.apk)
1. Download the `.apk` file from EAS build page
2. Enable "Install from Unknown Sources" on your Android device
3. Transfer `.apk` to device and tap to install
4. **No Expo Go needed** - it's a standalone app!

### iOS (.ipa)
1. Download the `.ipa` file from EAS build page
2. Option A - TestFlight:
   - Upload to App Store Connect
   - Distribute via TestFlight
3. Option B - Direct Install:
   - Use Xcode or Apple Configurator
   - Or use `eas submit` to submit to App Store
4. **No Expo Go needed** - it's a standalone app!

## Key Differences

| Build Type | Output | Install Method | Expo Go? |
|-----------|--------|----------------|----------|
| `preview` | .apk (Android) / .ipa (iOS) | Direct install | ❌ **NO** |
| `production` | .aab (Android) / .ipa (iOS) | App Stores | ❌ **NO** |
| `development` | Dev Client | Expo Dev Client app | ⚠️ Yes (Dev Client) |

## Quick Start

```bash
# 1. Build standalone Android app
eas build --profile preview --platform android

# 2. Download .apk from EAS dashboard
# 3. Install directly on Android device
# 4. Done! No Expo Go needed.
```

The app is now a **native standalone app** - it installs and runs independently, just like any other mobile app from the App Store or Play Store.


