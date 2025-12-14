# 📱 Android Build Guide

This guide will help you build the POS System as a native Android APK for installation on Android devices or publishing to the Google Play Store.

## Prerequisites

### Required Software

1. **Java Development Kit (JDK) 17+**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use [OpenJDK](https://openjdk.org/)
   - Verify installation: `java -version`

2. **Android Studio**
   - Download from [Android Developers](https://developer.android.com/studio)
   - Install with default settings
   - Required components:
     - Android SDK
     - Android SDK Platform (API 33+)
     - Android SDK Build-Tools
     - Android Emulator (optional, for testing)

3. **Node.js 18+**
   - Already installed if you've run the web app locally

## Initial Setup

### 1. Verify Capacitor Installation

The project already has Capacitor configured. Verify by checking:

```bash
cd /path/to/pos-app
ls -F android/
```

You should see an `android/` folder with Gradle files.

### 2. Configure Environment Variables

Ensure your `.env` file has the correct server URL:

```env
# For production builds pointing to cloud
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app

# For local development builds
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Update Capacitor Config

Edit `capacitor.config.ts`:

**For Local Development (Emulator):**

```typescript
server: {
  url: 'http://10.0.2.2:3000', // Android Emulator alias for localhost
  cleartext: true
}
```

**For Production (Cloud):**

```typescript
server: {
  url: 'https://your-vercel-app.vercel.app',
  cleartext: false
}
```

## Building the APK

### Option 1: Debug Build (For Testing)

1. **Start your Next.js server** (if building for local dev):

   ```bash
   npm run dev
   ```

2. **Sync Capacitor**:

   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:

   ```bash
   npx cap open android
   ```

4. **Build in Android Studio**:
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for the build to complete
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line Build

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Release Build (For Play Store)

1. **Generate a Signing Key**:

   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

2. **Configure Signing** in `android/app/build.gradle`:

   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('path/to/my-release-key.jks')
               storePassword 'your-store-password'
               keyAlias 'my-key-alias'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build Release APK**:

   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Build AAB (for Play Store)**:

   ```bash
   ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Installing on Device

### Via USB (ADB)

1. Enable **Developer Options** and **USB Debugging** on your Android device
2. Connect via USB
3. Run:

   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Via File Transfer

1. Copy `app-debug.apk` to your device (email, cloud drive, etc.)
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Tap **Install**

## Testing

### On Android Emulator

1. Open Android Studio
2. **Tools** → **Device Manager**
3. Create a new virtual device (e.g., Pixel 5, API 33)
4. Start the emulator
5. Run:

   ```bash
   npx cap run android
   ```

### On Physical Device

1. Enable **Developer Mode** on your Android device
2. Enable **USB Debugging**
3. Connect via USB
4. Run:

   ```bash
   npx cap run android
   ```

## Publishing to Google Play Store

1. **Create a Play Console Account**: [Google Play Console](https://play.google.com/console)
2. **Pay the registration fee** ($25 one-time)
3. **Create a new application**
4. **Upload the AAB file** (`app-release.aab`)
5. **Fill in required details**:
   - App name
   - Description
   - Screenshots
   - Privacy policy
   - Content rating
6. **Submit for review**

## Troubleshooting

### "Java not found" Error

- Install JDK 17 and set `JAVA_HOME` environment variable
- Verify: `java -version`

### "SDK location not found"

- Create `local.properties` in `android/` folder:

  ```properties
  sdk.dir=/path/to/Android/sdk
  ```

### App shows blank screen

- Check `capacitor.config.ts` server URL is correct
- Ensure Next.js server is running (for local builds)
- Check browser console in Android WebView (use Chrome DevTools)

### Build fails with "Gradle sync failed"

- Open project in Android Studio
- Let it download dependencies
- Click **File** → **Sync Project with Gradle Files**

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Need help?** Open an issue on [GitHub](https://github.com/Keshigami/POS-System/issues).
