# Subscription Manager - Android App

A native Android WebView application that provides a seamless mobile experience for the Subscription Manager web application.

## 📱 Overview

This Android app wraps the Subscription Manager web application in a native WebView, providing users with a native mobile app experience while leveraging the full functionality of the web application. The app includes native features like pull-to-refresh, proper back navigation, error handling, and offline support.

## ✨ Features

### Core Functionality
- **Native WebView Integration** - Seamless integration with the web application
- **Pull-to-Refresh** - Native swipe-to-refresh functionality
- **Back Navigation** - Proper Android back button handling
- **Error Handling** - User-friendly error messages with retry options
- **Loading States** - Native loading indicators and progress bars
- **Responsive Design** - Optimized for all Android screen sizes

### Enhanced Mobile Experience
- **Native Look & Feel** - Material Design components and theming
- **Gesture Support** - Zoom controls and touch navigation
- **Performance Optimized** - Efficient caching and memory management
- **Security Features** - SSL handling and secure communication
- **Deep Linking** - Handle web URLs and app shortcuts

### Platform Integration
- **Status Bar Integration** - Proper status bar theming
- **External Link Handling** - Opens payment links in external browsers for security
- **File Access** - Support for file uploads and downloads
- **Network Awareness** - Handles offline states gracefully

## 🛠 Prerequisites

### Development Environment
- **Android Studio** - Arctic Fox (2020.3.1) or later
- **Android SDK** - API Level 24 (Android 7.0) or higher
- **Java/Kotlin** - JDK 8 or later
- **Gradle** - 7.0 or later

### Target Devices
- **Minimum API Level**: 24 (Android 7.0 Nougat)
- **Target API Level**: 34 (Android 14)
- **Architecture**: ARM64, ARM, x86, x86_64

## 🚀 Setup Instructions

### 1. Clone and Navigate
```bash
cd subs-manage/android-app
```

### 2. Open in Android Studio
1. Launch Android Studio
2. Click "Open an existing project"
3. Navigate to `subs-manage/android-app`
4. Click "OK" and wait for Gradle sync

### 3. Configure Website URL
Edit `MainActivity.kt` and update the website URL:

```kotlin
// For development
private val websiteUrl = "http://10.0.2.2:5174" // Android emulator
// private val websiteUrl = "http://192.168.1.100:5174" // Physical device

// For production
// private val websiteUrl = "https://your-domain.com"
```

### 4. Update App Configuration
Modify `AndroidManifest.xml` to update domain handling:

```xml
<!-- Replace with your actual domain -->
<data android:scheme="https"
    android:host="your-domain.com" />
```

### 5. Customize App Details
Update `app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.subscriptionmanager"
        versionName "1.0"
        // ... other configs
    }
}
```

## 🔧 Building and Running

### Development Build
```bash
# Build debug APK
./gradlew assembleDebug

# Install and run on connected device
./gradlew installDebug
```

### Production Build
```bash
# Build release APK
./gradlew assembleRelease

# Generate signed APK (requires keystore setup)
./gradlew bundleRelease
```

### Running on Emulator
1. Create an AVD (Android Virtual Device) in Android Studio
2. Start the emulator
3. Click "Run" in Android Studio or use:
```bash
./gradlew installDebug
```

### Running on Physical Device
1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect device via USB
4. Run the app from Android Studio

## ⚙️ Configuration

### Network Configuration
For development with localhost, update `network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.100</domain>
    </domain-config>
</network-security-config>
```

### App Icon
Replace the default launcher icons in:
- `app/src/main/res/mipmap-*dpi/ic_launcher.png`
- `app/src/main/res/mipmap-*dpi/ic_launcher_round.png`

### Theme Customization
Modify colors in `app/src/main/res/values/colors.xml`:

```xml
<color name="colorPrimary">#3b82f6</color>
<color name="colorPrimaryVariant">#1d4ed8</color>
<!-- Add your brand colors -->
```

## 📱 App Architecture

### File Structure
```
android-app/
├── app/
│   ├── build.gradle                 # App-level build configuration
│   └── src/main/
│       ├── AndroidManifest.xml      # App manifest and permissions
│       ├── java/com/subscriptionmanager/app/
│       │   ├── MainActivity.kt       # Main WebView activity
│       │   └── SubscriptionManagerApplication.kt
│       └── res/
│           ├── layout/
│           │   └── activity_main.xml # Main layout with WebView
│           ├── values/
│           │   ├── colors.xml        # App colors
│           │   └── strings.xml       # App strings
│           └── drawable/
│               ├── ic_error.xml      # Error icon
│               └── ic_refresh.xml    # Refresh icon
├── build.gradle                     # Project-level build configuration
└── README.md                        # This file
```

### Key Components

#### MainActivity.kt
- **WebView Management** - Configures and manages the WebView
- **Navigation Handling** - Implements back button navigation
- **Error Handling** - Shows user-friendly error messages
- **External Links** - Handles payment and external URLs
- **Loading States** - Manages progress indicators

#### CustomWebViewClient
- **Page Loading** - Handles page start/finish events
- **Error Handling** - Manages HTTP and network errors
- **URL Override** - Controls which URLs open externally

#### CustomWebChromeClient
- **Progress Updates** - Shows loading progress
- **JavaScript Dialogs** - Handles alerts and prompts
- **Console Logging** - Manages WebView console output

## 🎨 Customization

### Changing the Website URL
1. Open `MainActivity.kt`
2. Update the `websiteUrl` variable
3. Update `AndroidManifest.xml` intent filters if needed
4. Rebuild the app

### Adding Custom Features
1. **Push Notifications**: Integrate Firebase Cloud Messaging
2. **Offline Support**: Implement caching strategies
3. **Biometric Auth**: Add fingerprint/face unlock
4. **App Shortcuts**: Create quick actions

### Styling
- **Colors**: Modify `res/values/colors.xml`
- **Strings**: Update `res/values/strings.xml`
- **Layout**: Customize `res/layout/activity_main.xml`

## 🐛 Troubleshooting

### Common Issues

#### "ERR_CLEARTEXT_NOT_PERMITTED" Error
- **Cause**: Trying to load HTTP content on modern Android
- **Solution**: Add network security config or use HTTPS

#### WebView Not Loading
- **Check**: Internet permissions in AndroidManifest.xml
- **Check**: Network connectivity on device/emulator
- **Check**: Website URL is accessible

#### Back Button Not Working
- **Check**: WebView history is being managed properly
- **Check**: `onKeyDown` method is implemented correctly

#### App Crashes on Startup
- **Check**: Android Studio logcat for error details
- **Check**: Minimum SDK version compatibility
- **Check**: Required permissions are granted

### Performance Issues
- **Memory**: Monitor WebView memory usage
- **Cache**: Clear WebView cache if needed
- **Network**: Optimize for slow connections

## 🔐 Security Considerations

### WebView Security
- JavaScript is enabled but limited to your domain
- File access is restricted
- Mixed content (HTTP/HTTPS) is handled appropriately
- External links open in system browser for security

### Permissions
- Only essential permissions are requested
- Location and camera permissions are optional
- Network access is required for core functionality

### Data Protection
- No sensitive data is stored locally
- WebView cache can be cleared by user
- Cookies follow web app security policies

## 📦 Distribution

### Google Play Store
1. Create a developer account
2. Generate signed APK/AAB
3. Complete store listing
4. Upload and publish

### Direct Distribution
1. Build signed APK
2. Enable "Unknown sources" on target devices
3. Install APK directly

### Enterprise Distribution
- Use Android Enterprise for corporate deployment
- Implement mobile device management (MDM) if needed

## 🚀 Deployment Scripts

### Build Script
```bash
#!/bin/bash
# build.sh
echo "Building Subscription Manager Android App..."
./gradlew clean assembleRelease
echo "APK generated at: app/build/outputs/apk/release/"
```

### Development Setup Script
```bash
#!/bin/bash
# setup.sh
echo "Setting up development environment..."
# Update local.properties with SDK path
echo "sdk.dir=/path/to/your/Android/Sdk" > local.properties
./gradlew sync
echo "Setup complete! Open in Android Studio."
```

## 📱 Testing

### Device Testing Matrix
- **Phones**: Various screen sizes and Android versions
- **Tablets**: Landscape and portrait orientations
- **Network**: WiFi, mobile data, offline scenarios
- **Performance**: Low-end and high-end devices

### Key Test Scenarios
1. **App Launch** - Cold start and warm start
2. **Navigation** - Back button, deep links, external URLs
3. **Network** - Online, offline, poor connection
4. **Orientation** - Portrait and landscape modes
5. **Memory** - Long usage sessions, background/foreground

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Style
- Follow Android Kotlin style guide
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 📄 License

This project is part of the Subscription Manager application suite.

## 🆘 Support

### Getting Help
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check the web app documentation

### Contact
- **Developer**: Your development team
- **Support**: Your support email
- **Website**: Your project website

---

## 🔄 Development Status

### Current Version: 1.0.0
- ✅ Basic WebView integration
- ✅ Error handling and retry logic
- ✅ Pull-to-refresh functionality
- ✅ Back navigation support
- ✅ External link handling
- ✅ Loading states and progress
- ✅ Material Design theming

### Upcoming Features
- 🔄 Push notifications for subscription reminders
- 🔄 Offline mode with cached content
- 🔄 Biometric authentication
- 🔄 App shortcuts for quick actions
- 🔄 Widget for subscription overview

### Known Limitations
- Requires internet connection for full functionality
- Payment processing requires external browser
- File uploads depend on device capabilities

---

**Happy coding! 🚀**