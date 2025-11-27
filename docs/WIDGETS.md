# NoContact App - Home Screen Widgets

This document covers the home screen widgets for the NoContact app, available for both iOS and Android.

## Overview

The NoContact widgets display your no-contact streak directly on your home screen, providing:
- Current streak counter (days)
- Daily encouragement message
- Quick tap-to-open access to the app
- Automatic updates when streak changes

## User Guide

### Adding the Widget to Your Home Screen

#### iOS

1. **Long press** on your home screen until apps start jiggling
2. Tap the **+** button in the top left corner
3. Search for "**NoContact**" or scroll to find it
4. Choose your widget size:
   - **Small**: Shows streak number and message
   - **Medium**: Shows streak plus "Today's Truth" and progress
5. Tap **Add Widget**
6. Position the widget where you want it
7. Tap **Done**

#### Android

1. **Long press** on an empty area of your home screen
2. Tap **Widgets**
3. Find "**No Contact Streak**" in the list
4. **Long press** and drag the widget to your home screen
5. Release to place the widget
6. Resize if needed by dragging the corners

### Widget Sizes

| Size | iOS | Android | Content |
|------|-----|---------|---------|
| Small | 2x2 | 2x2 | Streak number, "Days Strong", encouragement message |
| Medium | 4x2 | 4x2 | Streak + Today's Truth + progress to next milestone |

### Widget Updates

Widgets automatically update:
- Every time you open the app
- When your streak changes
- Every 15 minutes (background refresh)
- When you complete a daily check-in

### Tapping the Widget

Tapping anywhere on the widget opens the NoContact app directly to the home screen.

## Developer Setup

### Prerequisites

- Xcode 14+ (for iOS widgets)
- Android Studio with Kotlin support
- React Native development environment
- Expo SDK 54+

### Project Structure

```
src/
  hooks/
    useWidgetUpdate.js     # Hook for updating widgets
  utils/
    widgetData.js          # Shared data layer for widgets

native-widgets/           # Template files for native widgets
  ios/
    NoContactWidget.swift      # Main widget implementation
    NoContactWidgetBundle.swift # Widget bundle
    Info.plist                  # Widget extension info
    WidgetKitModule.swift       # RN bridge for WidgetKit
    WidgetKitModule.m           # Obj-C bridge header
    SharedGroupPreferences.swift # App Group storage
    SharedGroupPreferences.m    # Obj-C bridge header
  android/
    NoContactWidget.kt      # Main widget (Glance)
    WidgetModule.kt         # RN bridge module
    WidgetPackage.kt        # RN package registration
    widget_background.xml   # Gradient background
    widget_loading.xml      # Loading state layout
    nocontact_widget_info.xml # Widget configuration
    widget_strings.xml      # Widget strings
    AndroidManifest.widget.xml # Manifest additions
```

> **Note**: This is an Expo managed workflow project. The native widget code is stored in `native-widgets/` as templates. After running `expo prebuild`, copy these files to the appropriate locations in `ios/` and `android/` directories.

### iOS Setup

#### 1. Run Expo Prebuild

```bash
npx expo prebuild
```

This generates the native `ios/` directory.

#### 2. Create Widget Extension in Xcode

1. Open `ios/NoContactApp.xcworkspace` in Xcode
2. File > New > Target > Widget Extension
3. Name: `NoContactWidget`
4. Enable "Include Configuration Intent" for size options

#### 3. Configure App Groups

1. Select main app target > Signing & Capabilities
2. Click `+ Capability` > Add "App Groups"
3. Create group: `group.com.nocontact.app`
4. Repeat for widget extension target

#### 4. Add Widget Files

Copy the Swift files from `native-widgets/ios/` to your widget extension target:

```bash
cp native-widgets/ios/*.swift ios/NoContactWidget/
cp native-widgets/ios/*.m ios/NoContactWidget/
cp native-widgets/ios/Info.plist ios/NoContactWidget/
```

#### 5. Update Build Settings

Ensure the widget extension:
- Has the same development team as the main app
- Uses the correct App Group ID
- Targets iOS 14.0+

### Android Setup

#### 1. Run Expo Prebuild

```bash
npx expo prebuild
```

This generates the native `android/` directory.

#### 2. Add Glance Dependencies

Add to `android/app/build.gradle`:

```gradle
dependencies {
    implementation "androidx.glance:glance:1.0.0"
    implementation "androidx.glance:glance-appwidget:1.0.0"
}
```

#### 3. Copy Widget Files

```bash
# Copy Kotlin files
mkdir -p android/app/src/main/java/com/nocontact/widget
cp native-widgets/android/*.kt android/app/src/main/java/com/nocontact/widget/

# Copy resource files
cp native-widgets/android/widget_background.xml android/app/src/main/res/drawable/
cp native-widgets/android/nocontact_widget_info.xml android/app/src/main/res/xml/
cp native-widgets/android/widget_loading.xml android/app/src/main/res/layout/
cp native-widgets/android/widget_strings.xml android/app/src/main/res/values/
```

#### 4. Register Widget Receiver

Add to `android/app/src/main/AndroidManifest.xml` inside `<application>`:

```xml
<receiver
    android:name=".widget.NoContactWidgetReceiver"
    android:exported="true"
    android:label="@string/widget_name">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/nocontact_widget_info" />
</receiver>
```

#### 5. Register Native Module

In `MainApplication.java` or `MainApplication.kt`, add:

```kotlin
import com.nocontact.widget.WidgetPackage

// In getPackages():
packages.add(WidgetPackage())
```

### Using the Widget Hook

The `useWidgetUpdate` hook automatically updates widgets when streak data changes:

```javascript
import { useWidgetUpdate } from '../hooks/useWidgetUpdate';

const MyComponent = () => {
  const [streak, setStreak] = useState(0);

  // Widget updates automatically when streak changes
  const { updateWidget } = useWidgetUpdate({
    currentStreak: streak,
    encouragementMessage: "You're doing great!",
  });

  // Manually trigger widget update if needed
  const handleStreakChange = async (newStreak) => {
    setStreak(newStreak);
    await updateWidget();
  };

  return <View>...</View>;
};
```

### Widget Data Structure

The widget data service uses this structure:

```javascript
{
  currentStreak: number,        // Current streak in days
  longestStreak: number,        // Longest streak achieved
  lastUpdated: string,          // ISO timestamp
  encouragementMessage: string, // Message to display
  streakMessage: string,        // Streak milestone message
  nextMilestone: number,        // Next milestone (7, 14, 30, etc.)
  daysToMilestone: number,      // Days until next milestone
}
```

## Design Specifications

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background Start | Primary Purple | `#7C3AED` |
| Background End | Primary Dark | `#6D28D9` |
| Text Primary | White | `#FFFFFF` |
| Text Secondary | White 90% | `rgba(255,255,255,0.9)` |
| Text Muted | White 75% | `rgba(255,255,255,0.75)` |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Streak Number | 56sp | Bold |
| "Days Strong" | 14sp | Semibold |
| Encouragement | 11sp | Regular |

### Spacing

- Widget padding: 16dp
- Element spacing: 8dp
- Border radius: 16dp

## Troubleshooting

### Widget Not Appearing in Gallery

**iOS:**
- Ensure widget extension is included in build target
- Check that App Groups are configured correctly
- Restart device and try again

**Android:**
- Verify AndroidManifest.xml has widget receiver
- Check that all resource files exist
- Clear app data and reinstall

### Widget Not Updating

1. Ensure the app is using the widget update hook
2. Check that AsyncStorage is working correctly
3. Force refresh by removing and re-adding widget
4. Check console logs for errors

### Widget Shows "Open app to sync"

This means the widget hasn't received data yet:
1. Open the NoContact app
2. Let it load completely
3. Widget should update within seconds

### Deep Linking Not Working

**iOS:**
- Verify URL scheme `nocontact` is in Info.plist
- Check AppDelegate handles the URL scheme

**Android:**
- Verify intent filter in AndroidManifest.xml
- Check MainActivity handles the intent

## Testing Checklist

### iOS
- [ ] Widget appears in widget gallery
- [ ] Small widget displays correctly
- [ ] Medium widget displays correctly
- [ ] Widget updates when app updates streak
- [ ] Tapping widget opens app
- [ ] Widget refreshes every 15 minutes
- [ ] Widget works in light/dark mode
- [ ] Widget shows correct data after app restart

### Android
- [ ] Widget appears in widget picker
- [ ] Widget displays on home screen
- [ ] Widget updates when app updates streak
- [ ] Tapping widget opens app
- [ ] Widget refresh works
- [ ] Widget handles no data gracefully
- [ ] Widget survives device restart

## API Reference

### widgetDataService

```javascript
import { widgetDataService } from '../utils/widgetData';

// Update widget data
await widgetDataService.updateWidgetData({
  currentStreak: 42,
  longestStreak: 42,
  encouragementMessage: "You're unstoppable!",
});

// Get current widget data
const data = await widgetDataService.getWidgetData();

// Force refresh all widgets
await widgetDataService.refreshWidgets();

// Get random encouragement message
const message = widgetDataService.getRandomEncouragement();

// Calculate next milestone
const milestone = widgetDataService.calculateNextMilestone(currentStreak);
```

### useWidgetUpdate Hook

```javascript
import { useWidgetUpdate } from '../hooks/useWidgetUpdate';

const { updateWidget, refreshWidgets } = useWidgetUpdate({
  currentStreak: streak,
  longestStreak: longestStreak,
  encouragementMessage: customMessage,
});

// Manually update widget
await updateWidget();

// Force refresh all widgets
await refreshWidgets();
```

## Support

For issues with widgets:
1. Check the troubleshooting section above
2. Ensure you're on the latest app version
3. Try removing and re-adding the widget
4. Contact support if issues persist
