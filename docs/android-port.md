# Android port — working notes

## State
Platform generated (`apps/web/android`), debug APK builds. App id
`com.hiddenhiqmah.app`, label "Hiqmah", minSdk 24 / target 36. Toolchain is CLI
only: `openjdk@21` + `android-commandlinetools` via Homebrew, no Android Studio.

    export JAVA_HOME=/opt/homebrew/opt/openjdk@21
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    cd apps/web && npx cap sync android && cd android && ./gradlew assembleDebug

## Permissions: who declares what
`@capacitor/geolocation`, `@capacitor/push-notifications` and the voice recorder
declare **none** — the app manifest must. `@capacitor/local-notifications`
merges in POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, VIBRATE, but
**not** SCHEDULE_EXACT_ALARM.

## ⭐ The decision that matters: exact alarms
The adhan must fire AT the prayer time. Android 12+ silently downgrades alarms
to inexact without an exact-alarm permission, and they drift by minutes — the
product failing quietly rather than loudly.

- **Declared: `SCHEDULE_EXACT_ALARM`.** Denied by default on Android 13+, so the
  app must call `LocalNotifications.checkExactNotificationSetting()` and walk the
  user to the system screen via `changeExactNotificationSetting()`. Both exist in
  the plugin (v8).
- **NOT declared: `USE_EXACT_ALARM`.** Auto-granted, no prompt — but Play policy
  restricts it to apps whose *core function* is alarms/calendar. A prayer-times
  app is a defensible claim and many Islamic apps make it, but it is a policy
  argument to have deliberately. **Founder decision, not a default.**

## Known gaps (not yet built)
1. **Background audio — CONFIRMED REQUIRED, not assumed.** `adb shell dumpsys
   audio` while the app plays says, in as many words:

       AudioHardening background playback would be muted for
       com.hiddenhiqmah.app (10214), level: partial

   So Android WILL mute us the moment the app backgrounds. The WebView does
   request focus correctly in the foreground (`requestAudioFocus() ...
   USAGE_MEDIA` from the chromium content layer), so this is purely the
   background case. iOS solves it with `UIBackgroundModes: audio` +
   AVAudioSession; Android needs FOREGROUND_SERVICE +
   FOREGROUND_SERVICE_MEDIA_PLAYBACK and an actual service with a notification.
   **This is the last big architectural gap, and it is load-bearing: the adhan
   firing at prayer time is the app's core promise, and it fires while the app
   is in the background by definition.**
2. **Compass.** `HeadingBridge.swift` → `SensorManager` /
   `TYPE_ROTATION_VECTOR`. ⚠️ Android does **not** apply magnetic declination
   for you the way iOS `trueHeading` does — it must be applied explicitly, and
   `QiblahSection` has exactly one dial entry point so it can never be applied
   twice. See [[project-lockscreen-widgets]] for that invariant.
3. **Push.** APNs → FCM. Migration 031 already parameterises dispatch per-DB.
4. **Doze / per-OEM alarm killing** (Xiaomi, Huawei, Samsung). The real
   reliability risk; needs device testing, not code review.
5. **Widgets** — all six are WidgetKit. Glance rewrite, deliberately v2.
