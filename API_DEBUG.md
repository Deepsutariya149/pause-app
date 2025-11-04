# API Debugging Guide

## Added Logging

I've added comprehensive logging throughout the API call chain:

1. **API Configuration** - Shows the API URL being used
2. **API Requests** - Logs every request with method, URL, data, and headers
3. **API Responses** - Logs successful responses with status and data
4. **API Errors** - Logs errors with status, message, and response data
5. **Service Layer** - Logs when auth service methods are called
6. **Hook Layer** - Logs when mutations are triggered
7. **Component Layer** - Logs form submissions

## How to See Logs

### In Development:
- Open Metro bundler terminal - logs will appear there
- Check React Native debugger if enabled
- Use `npx react-native log-android` for Android
- Use `npx react-native log-ios` for iOS

### In Expo Go:
- Shake device to open DevMenu
- Select "Debug Remote JS"
- Open browser console (Chrome DevTools)

## Expected Log Flow

When you submit the login form, you should see:

```
🚀 Login Form Submitted: { email: "..." }
🎯 useAuth login called: { email: "...", password: "..." }
🔐 Login Service Called: { email: "..." }
🔵 API Request: { method: "POST", url: "http://.../auth/login", data: {...} }
🟢 API Response: { status: 200, url: "...", data: {...} }
✅ Login Success: { access_token: "Present", user: {...} }
💾 Token and User saved to storage
✅ Login mutation success: {...}
✅ Login successful, navigating to Tabs
```

If there's an error:

```
🔴 API Error: { status: 401/500/etc, url: "...", message: "...", responseData: {...} }
❌ Login Failed: {...}
❌ Login mutation error: {...}
❌ Login Error in component: {...}
```

## API URL Configuration

⚠️ **Important**: `localhost:3000` won't work on physical devices!

### For Android Emulator:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### For iOS Simulator:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### For Physical Device:
1. Find your computer's IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Use that IP:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
   ```

### For All Devices (Recommended):
Use your computer's actual IP address:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
```

## Troubleshooting

### No Logs Appearing?
1. Check Metro bundler is running
2. Restart the app completely
3. Clear cache: `npx expo start --clear`
4. Check console.log isn't being stripped in production builds

### API Not Called?
1. Check the logs show "🚀 Login Form Submitted"
2. Verify validation passes (should see no validation errors)
3. Check network permissions are enabled
4. Verify backend is running and accessible

### Connection Errors?
1. Check backend is running on the specified port
2. Verify firewall isn't blocking connections
3. Check device/emulator can reach your computer
4. Try accessing the API URL in device browser

### 401/403 Errors?
1. Check backend CORS settings
2. Verify authentication endpoints match
3. Check request headers are correct

## Testing API Connection

Test if the API is reachable:

```bash
# From device/emulator, test the connection
# You can add a test button in the login screen temporarily
```

## Network Debugging

Enable network logging in `api.ts` - it's already there! Check your Metro bundler or React Native debugger console.


