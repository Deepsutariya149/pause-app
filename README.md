# Pause. Mobile App

A wellness platform mobile app built with Expo (EAS Build), React Native, and TypeScript.

## 🚀 Features

- **Auth & Onboarding**
  - Splash screen and onboarding carousel
  - Login/Signup with validation
  - Forgot password (OTP via backend)
  - Google OAuth integration
  - JWT authentication with auto-login

- **Dashboard**
  - Daily mood summary
  - Motivational quotes
  - Quick actions (Journal, Exercises, Mood)

- **Journal**
  - Create, read, update, delete journal entries
  - Voice note upload via Cloudinary
  - AI tone analysis

- **Mood Tracker**
  - Daily mood logging
  - Weekly mood trend charts
  - Mood streak tracking

- **Exercises**
  - Breathing and mindfulness sessions
  - Audio/video playback
  - Session timer

- **Profile**
  - View and edit profile
  - Avatar upload via Cloudinary
  - Logout functionality

## 🛠 Tech Stack

- **Framework**: Expo SDK 54 (EAS Build + TypeScript)
- **UI**: Styled Components
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: TanStack Query
- **Validation**: Zod
- **Local Storage**: AsyncStorage
- **API Requests**: Axios (with JWT interceptor)
- **Charts**: react-native-gifted-charts
- **Push Notifications**: Firebase Cloud Messaging (via expo-notifications)
- **File Uploads**: Cloudinary
- **Build System**: EAS Build (managed workflow)

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth screens
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── onboarding/
│   │   ├── (tabs)/          # Tab screens
│   │   │   ├── home/
│   │   │   ├── journal/
│   │   │   ├── mood/
│   │   │   ├── exercises/
│   │   │   └── profile/
│   │   ├── _layout.tsx      # Root layout with navigation
│   │   └── index.tsx
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── utils/                # Utilities (storage, validation)
│   ├── types/                # TypeScript types
│   └── theme/                # Theme (colors, spacing, typography)
├── .env                      # Environment variables
├── app.json                  # Expo config
├── eas.json                  # EAS Build config
├── package.json
└── tsconfig.json
```

## 🔧 Setup

### Prerequisites

- Node.js 18+
- Yarn or npm
- Expo CLI
- EAS CLI (for building)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Configure environment variables:
Create a `.env` file in the root with:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

3. Start the development server:
```bash
yarn start
```

### Running on Device

#### ⚠️ Important: Expo Go vs Standalone App

**`yarn android` / `yarn ios`** → Uses **Expo Go** (requires Expo Go app installed)

**For Standalone App (NO Expo Go):**

1. **Option 1: Local Build (Recommended for Development)**
   ```bash
   # Build and run standalone Android app locally (requires Android Studio)
   yarn run:android
   
   # Build and run standalone iOS app locally (requires Xcode)
   yarn run:ios
   ```
   This creates a **standalone app** that installs directly - NO Expo Go needed!

2. **Option 2: EAS Build (For Testing/Distribution)**
   ```bash
   # Build standalone APK for Android
   yarn build:android
   
   # Download APK from EAS dashboard and install on device
   # NO Expo Go required!
   ```

3. **Option 3: Development Build with EAS**
   ```bash
   # Build development client (standalone, allows native modules)
   yarn build:dev:android
   
   # Install the APK on device, then run:
   yarn start --dev-client
   ```

**Quick Comparison:**
| Command | App Type | Expo Go? | When to Use |
|---------|----------|----------|-------------|
| `yarn android` | Expo Go | ✅ Yes | Quick testing |
| `yarn run:android` | Standalone | ❌ No | Local development |
| `yarn build:android` | Standalone APK | ❌ No | Testing/Distribution |

## 🏗 Building with EAS

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Initialize EAS:
```bash
eas init
```

4. Build:
```bash
# Development build (creates dev client - requires Expo Dev Client app)
eas build --profile development --platform ios

# Preview build (standalone APK/IPA for testing - NO Expo Go needed)
eas build --profile preview --platform android  # Creates .apk for direct install
eas build --profile preview --platform ios       # Creates .ipa for TestFlight/internal

# Production build (standalone app for App Store/Play Store)
eas build --profile production --platform all    # Creates .ipa/.aab for stores
```

**Important**: 
- `preview` and `production` builds create **standalone apps** that install directly (no Expo Go)
- `development` builds create a custom dev client (still requires Expo Dev Client app)
- For testing without Expo Go, use `preview` profile

## 🔌 Backend Integration

The app connects to the NestJS backend at `${EXPO_PUBLIC_API_URL}`. Ensure:
- Backend is running and accessible
- CORS is configured correctly
- JWT tokens are handled properly
- API endpoints match the expected structure

## 📱 Features in Detail

### Authentication Flow

1. **Onboarding**: First-time users see onboarding screens
2. **Login/Signup**: Email/password or OAuth
3. **Auto-login**: JWT token stored in AsyncStorage
4. **Logout**: Clears token and redirects to login

### Mood Tracking

- Select mood from 5 options (Terrible to Great)
- View weekly trend in line chart
- Date navigation to track past moods
- Mood streak calculation

### Journal

- Create journal entries with title and content
- Upload voice notes via Cloudinary
- AI tone analysis (calls backend `/journal/{id}/analyze`)
- View and manage all entries

### Exercises

- Browse breathing and mindfulness exercises
- Start session with timer
- Audio/video playback support
- Track session duration

## 🔐 Environment Variables

Required environment variables:
- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset
- `EXPO_PUBLIC_PROJECT_ID`: Expo project ID (for push notifications)
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID

## 📝 Notes

- The app uses Expo's managed workflow with EAS Build
- All native modules are pre-installed via `expo install`
- Push notifications require Firebase setup
- Cloudinary integration needs account setup
- Google OAuth requires OAuth client configuration

## 🐛 Troubleshooting

- **Navigation issues**: Ensure `react-native-gesture-handler` is imported at the top of App.tsx
- **API errors**: Check backend URL and CORS settings
- **Build errors**: Run `npx expo install --check` to verify package versions
- **Environment variables**: Ensure all `EXPO_PUBLIC_*` vars are set

## 📄 License

Private project for Pause. wellness platform.

