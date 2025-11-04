# Running Standalone App Locally (NO Expo Go)

## The Problem

When you run `yarn android`, it opens **Expo Go** which requires the Expo Go app to be installed. For a **standalone app** that installs directly (like a real app), you need a different approach.

## ✅ Solution: Local Standalone Build

### For Android

#### Prerequisites
1. **Android Studio** installed
2. **Android SDK** configured
3. **Android device** connected OR **emulator** running
4. Environment variables set up in `.env`

#### Build and Run Standalone App Locally

```bash
# This builds a standalone APK and installs it on your device/emulator
# NO Expo Go needed!
yarn run:android
```

**What this does:**
1. Compiles the native Android code
2. Builds a standalone APK
3. Installs it on your connected device/emulator
4. Launches the app

**First time setup:**
- If you get errors, make sure Android Studio is installed
- Run `android-studio` or open Android Studio
- Install Android SDK (via SDK Manager)
- Accept Android licenses: `yes | sdkmanager --licenses`

### For iOS

#### Prerequisites
1. **Xcode** installed (macOS only)
2. **CocoaPods** installed: `sudo gem install cocoapods`
3. **iOS Simulator** or **physical device** connected

#### Build and Run Standalone App Locally

```bash
# This builds a standalone IPA and installs it on simulator/device
# NO Expo Go needed!
yarn run:ios
```

**What this does:**
1. Compiles the native iOS code
2. Builds a standalone app
3. Installs it on your simulator/device
4. Launches the app

**First time setup:**
- Install CocoaPods: `cd ios && pod install && cd ..`
- Open Xcode and accept licenses if prompted

## Alternative: EAS Build for Testing

If local build doesn't work or you want to test on a physical device:

### 1. Build Standalone APK with EAS

```bash
# Build standalone Android APK (takes 10-20 minutes)
yarn build:android

# OR
eas build --profile preview --platform android
```

### 2. Download and Install APK

1. Go to [Expo Dashboard](https://expo.dev)
2. Navigate to your project → Builds
3. Download the `.apk` file
4. Transfer to your Android device
5. Enable "Install from Unknown Sources"
6. Install the APK - **NO Expo Go needed!**

### 3. Run Development Server

After installing the standalone app:

```bash
# Start dev server
yarn start

# The standalone app will connect to your dev server
# Changes will hot-reload (if you built with development profile)
```

## Development Build vs Preview Build

### Development Build
```bash
yarn build:dev:android
```
- Standalone app with development client
- Can hot-reload changes
- Allows native debugging
- Still **NO Expo Go** - it's a custom dev client

### Preview Build
```bash
yarn build:android
```
- Production-like standalone app
- No hot-reload (but can be updated via OTA)
- Ready for testing/internal distribution
- **NO Expo Go** - it's a real standalone app

## Summary

| Method | Command | Time | Expo Go? | Hot Reload? |
|--------|---------|------|----------|-------------|
| **Expo Go** | `yarn android` | Instant | ✅ Yes | ✅ Yes |
| **Local Build** | `yarn run:android` | 5-10 min (first time) | ❌ No | ✅ Yes |
| **EAS Dev Build** | `yarn build:dev:android` | 15-20 min | ❌ No | ✅ Yes |
| **EAS Preview Build** | `yarn build:android` | 15-20 min | ❌ No | ❌ No* |

*Can use EAS Update for OTA updates

## Recommended Workflow

### For Active Development:
```bash
# 1. Build standalone app locally (one time)
yarn run:android

# 2. Make changes to code
# 3. App hot-reloads automatically - NO Expo Go needed!
```

### For Testing/Distribution:
```bash
# Build standalone APK
yarn build:android

# Download from EAS dashboard and install on device
# This is a REAL app, just like from Play Store!
```

## Troubleshooting

### "Command not found: expo run:android"
Install Expo CLI:
```bash
npm install -g expo-cli
```

### Android Build Fails
1. Check Android Studio is installed
2. Verify Android SDK path in `~/.android/sdk`
3. Accept licenses: `yes | sdkmanager --licenses`
4. Check device/emulator is connected: `adb devices`

### iOS Build Fails
1. Check Xcode is installed: `xcode-select --print-path`
2. Install CocoaPods: `sudo gem install cocoapods`
3. Run pod install: `cd ios && pod install`

### App Not Connecting to Dev Server
- Make sure dev server is running: `yarn start`
- Check device and computer are on same network
- For physical device, use your computer's IP in `.env`: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`


