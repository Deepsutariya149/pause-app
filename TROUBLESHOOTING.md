# Troubleshooting Guide

## Fixed Issues ✅

### 1. Gradient Package Error
**Error:** `Gradient package was not found`
**Solution:** Installed `expo-linear-gradient@~15.0.7`

### 2. styled-components Compatibility
**Error:** styled-components v6 not compatible with React Native
**Solution:** Downgraded to `styled-components@^5.3.11` and added babel config

### 3. Babel Plugin
**Solution:** Created `babel.config.js` with styled-components plugin

## Next Steps to Run the App

### Clean Installation

```bash
# 1. Stop the current dev server (Ctrl+C)

# 2. Clear Metro cache
npx expo start --clear

# OR if that doesn't work:
watchman watch-del-all
rm -rf node_modules
rm -f yarn.lock
yarn install
npx expo start --clear
```

### Run the App

#### Option A: Expo Go (Quick Testing)
```bash
# This uses Expo Go app
yarn start
# Then scan QR code with Expo Go app on phone
```

#### Option B: Standalone Local Build (Recommended)
```bash
# This builds a standalone app - NO Expo Go needed
yarn run:android

# First time will take 5-10 minutes to build
# Subsequent runs are faster
```

#### Option C: EAS Build (For Testing/Distribution)
```bash
# Build standalone APK
yarn build:android

# Download APK from expo.dev and install on device
```

## Common Issues

### "Command not found: expo"
Install Expo CLI globally:
```bash
npm install -g expo-cli
```

### Android Build Fails
Ensure Android Studio is installed and configured:
1. Open Android Studio
2. Install Android SDK
3. Accept licenses: `yes | sdkmanager --licenses`
4. Set ANDROID_HOME environment variable

### iOS Build Fails (macOS only)
1. Install Xcode from App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Run: `cd ios && pod install && cd ..`

### App Keeps Crashing
1. Clear all caches: `watchman watch-del-all && rm -rf node_modules && yarn install`
2. Start fresh: `npx expo start --clear`
3. If using EAS build, rebuild with latest code

### Metro Bundler Issues
```bash
# Kill all Metro processes
killall -9 node

# Clear cache and restart
npx expo start --clear
```

### styled-components Not Working
Make sure `babel.config.js` exists with the plugin:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['babel-plugin-styled-components', {
        ssr: false,
        displayName: true,
        fileName: false,
      }],
    ],
  };
};
```

## Environment Variables

Make sure `.env` file exists in `mobile-app/` folder:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
EXPO_PUBLIC_PROJECT_ID=b61650cf-8728-43ae-a01a-a01a7a7c55e3
```

## Build Status

✅ All dependencies installed
✅ babel.config.js configured
✅ expo-linear-gradient installed
✅ styled-components downgraded
✅ EAS build configuration ready
✅ Navigation setup complete
✅ All screens implemented

## Quick Start

```bash
# Clean everything
watchman watch-del-all
rm -rf node_modules yarn.lock
yarn install

# Start fresh
npx expo start --clear

# For standalone app
yarn run:android
```

## Need Help?

- Check Expo docs: https://docs.expo.dev
- Check EAS docs: https://docs.expo.dev/build/introduction/
- styled-components: https://styled-components.com/docs/basics#react-native


