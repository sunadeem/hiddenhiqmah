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
1. **Background audio.** iOS uses `UIBackgroundModes: audio` + AVAudioSession.
   On Android, WebView audio stops when backgrounded without a foreground
   service — so adhan-at-prayer-time and Qur'an playback need
   FOREGROUND_SERVICE + FOREGROUND_SERVICE_MEDIA_PLAYBACK and a real service.
2. **Compass.** `HeadingBridge.swift` → `SensorManager` /
   `TYPE_ROTATION_VECTOR`. ⚠️ Android does **not** apply magnetic declination
   for you the way iOS `trueHeading` does — it must be applied explicitly, and
   `QiblahSection` has exactly one dial entry point so it can never be applied
   twice. See [[project-lockscreen-widgets]] for that invariant.
3. **Push.** APNs → FCM. Migration 031 already parameterises dispatch per-DB.
4. **Doze / per-OEM alarm killing** (Xiaomi, Huawei, Samsung). The real
   reliability risk; needs device testing, not code review.
5. **Widgets** — all six are WidgetKit. Glance rewrite, deliberately v2.
