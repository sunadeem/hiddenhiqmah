# Android port — working notes

## State
Platform generated (`apps/web/android`), debug APK builds. App id
`com.hiddenhiqmah.app`, label "Hiqmah", minSdk 24 / target 36. Toolchain is CLI
only: `openjdk@21` + `android-commandlinetools` via Homebrew, no Android Studio.

    export JAVA_HOME=/opt/homebrew/opt/openjdk@21
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    cd apps/web && BUILD_TARGET=mobile npx next build \
      && npx cap sync android && cd android && ./gradlew assembleDebug

⭐ **`next build` is NOT the mobile build, and getting this wrong silently
invalidates every device test.** The static export lands in `out/` only under
`BUILD_TARGET=mobile` (= `pnpm build:mobile`). Plain `npx next build` exits 0,
prints a normal route table, and leaves `out/` **untouched** — so the next
`cap sync` copies the PREVIOUS bundle into the APK. Build green, app runs,
executing stale JavaScript. This cost a real debugging detour: a freshly added
`createChannel()` call never showed up in logcat and the source looked wrong,
when the bundle was simply old. **Verify, don't assume** — before `cap sync`:

    grep -rl "<a string you just added>" out/

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
1. ~~**Background audio**~~ ✅ **BUILT** — `PlaybackService.java` +
   `PlaybackBridge.java`, registered in `MainActivity`. The service plays
   NOTHING; the WebView still owns playback, the service just makes it legal to
   keep sounding once backgrounded. Hooked into `audioCoordinator` (the single
   point both channels already pass through), with focus tracking so a channel
   stopped BECAUSE another claimed focus can't tear down the service that one
   raised. ⚠️ `packages/ui` is deliberately Capacitor-free — it exposes
   `setPlaybackServiceHook` and `apps/web/src/lib/mobile/playbackService.ts`
   installs the impl from native setup. **Still unverified: whether audio really
   survives backgrounding. Needs a real device.**


2. **Compass.** `HeadingBridge.swift` → `SensorManager` /
   `TYPE_ROTATION_VECTOR`. ⚠️ Android does **not** apply magnetic declination
   for you the way iOS `trueHeading` does — it must be applied explicitly, and
   `QiblahSection` has exactly one dial entry point so it can never be applied
   twice. See [[project-lockscreen-widgets]] for that invariant.
3. ~~**Push.**~~ ✅ **BUILT** — see "Push / FCM" below. Waiting only on the
   server credentials.
4. **Doze / per-OEM alarm killing** (Xiaomi, Huawei, Samsung). The real
   reliability risk; needs device testing, not code review.
5. **Widgets** — all six are WidgetKit. Glance rewrite, deliberately v2.

## Push / FCM

`google-services.json` lives at `apps/web/android/app/` and is **gitignored on
purpose** — see the long note in `android/.gitignore`. A fresh clone cannot build
Android until it is restored from the Firebase console.

No Gradle edit was needed: Capacitor's `app/build.gradle` template already applies
the `com.google.gms.google-services` plugin inside a `try` that first checks the
file exists, and the classpath is already in the root `build.gradle`. (The often-
repeated warning that "adding the plugin without the JSON hard-fails the build" is
true in general, and is exactly what that template guard defuses.)

**Server side.** `lib/push/apns.ts` was iOS-only, and every send route filtered
`platform === "ios"`. Now:

- `lib/push/fcm.ts` — FCM HTTP v1: service-account **RS256** JWT → OAuth2 access
  token → `POST /v1/projects/{id}/messages:send`. ⚠️ Note the algorithm
  difference from APNs, which is **ES256 and needs `dsaEncoding: "ieee-p1363"`**;
  copying the APNs signing call here produces a signature Google rejects as
  `invalid_grant`.
- `lib/push/send.ts` — the one entry point routes now call. Splits by platform,
  merges both results into a single `SendManyResult` so route code is unchanged.

Three ways FCM is not APNs, each of which shaped the code:
1. **No environment split** — one endpoint for debug and release. So `corrected`
   is APNs-only and an Android row's `environment` column is inert.
2. **No multicast** — HTTP v1 is one token per request; a fan-out is N calls.
3. **`data` must be flat strings** — nested objects are rejected with
   `INVALID_ARGUMENT`, which looks exactly like a dead token.

⚠️ **The invariant to not break: never mark a token stale because a transport is
unconfigured.** Callers DELETE `staleTokens`, and a token only comes back when
that user next opens the app — so a missing or rotated FCM key, treated as "these
devices are dead", would silently unsubscribe the entire Android fleet. Only
`UNREGISTERED` and `INVALID_ARGUMENT` mark a token stale; auth, quota, 5xx and
network failures report `ok: false` with an EMPTY `staleTokens`.

**Client.** `lib/mobile/push.ts` sent `p_platform: "ios"` hardcoded. Left alone,
Android would have registered FCM tokens as APNs ones, and the sender would have
read the resulting `BadDeviceToken` as a dead device — deleting and re-creating
the same row forever, with the route still reporting `ok: true`.

**Notification icon.** Android takes the **alpha channel only** of a small icon
and re-tints it, so the full-colour launcher icon renders as a solid white
square — the default for any Capacitor app that never declares one, on FCM pushes
*and* local notifications. `res/drawable/ic_stat_hiqmah.xml` is the mark reduced
to a flat silhouette; wired via `default_notification_icon`/`_color` meta-data for
push, and `LocalNotifications.smallIcon`/`iconColor` in `capacitor.config.ts` for
the adhan.

**Still owed (founder):** the service-account key — Firebase Console → Project
Settings → Service accounts → *Generate new private key* — split into Vercel env
vars `FCM_PROJECT_ID` (`hiqmah-c6cd3`), `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`.
Until they exist, `isFcmConfigured()` is false, Android tokens report
"FCM not configured", and — by the invariant above — are left untouched.

**Verified:** APK builds; `FirebaseApp` initialises; a real FCM registration token
is issued on a Play-Store-image emulator. **Unverified:** any actual delivery.

## Release builds (Play uploads)

    cd apps/web && BUILD_TARGET=mobile npx next build && npx cap sync android
    cd android && ./gradlew bundleRelease
    # -> app/build/outputs/bundle/release/app-release.aab

Play takes an **.aab**, not an APK. The debug APK used for emulator work is
signed with the debug key and flagged `application-debuggable`; it cannot be
uploaded.

**The upload key.** `android/upload-keystore.jks` + `android/keystore.properties`
are **gitignored, and that mattered**: Capacitor's template ships `*.jks` and
`*.keystore` COMMENTED OUT in `android/.gitignore`, i.e. keystores are committed
by default. On this public repo that would have published the key that signs
every release — and while Play App Signing lets Google reset a lost *upload* key,
nothing can revoke a leaked one. The ignore patterns were uncommented and
verified with a throwaway `.jks` **before** the real key was generated.

The password lives only in `keystore.properties`, on one machine. It belongs in a
password manager.

`app/build.gradle` reads that file if present and otherwise **does not create the
release signingConfig at all**, so `bundleRelease` fails loudly on a machine
without the secret rather than emitting an unsigned bundle that Play would reject
only after upload. Debug builds are unaffected.

Upload key fingerprint (SHA-256), for confirming what Play registered:

    2B:D4:9A:81:DE:20:8A:F1:7B:F4:19:85:68:F5:09:F7:AE:77:A9:FB:AC:B5:B7:E4:AF:D1:EB:B3:7B:3D:2E:99

**Verify before uploading** — `jarsigner -verify <aab>` must print `jar verified.`

## Play store listing assets

Generated into `apps/web/android/`:

| Asset | File | Play requirement |
|---|---|---|
| App icon | `play-store-icon-512.png` | 512×512, uploaded separately from the AAB |
| Feature graphic | `play-feature-graphic-1024x500.png` | 1024×500, no transparency |
| Phone screenshots | `play-screenshots/01…07.png` | ≥2, 9:16, 320–3840px per side |

Screenshots were captured with the emulator display forced to **1080×1920** —
`adb shell wm size 1080x1920` — because its native 1080×2400 is 9:20, past the
2:1 aspect ratio Play accepts. Capturing at 9:16 avoids letterboxing a tall
screenshot onto a padded canvas. `adb shell wm size reset` afterwards.

⚠️ **The home screen is deliberately NOT among them.** The emulator cannot
satisfy the app's location request, so it falls back to Makkah while the device
clock stays in America/New_York — the prayer times shown are nonsense and would
read as a broken app on the listing. Re-shoot the home screen from a real device
before relying on it in marketing.

### Why the emulator can't do prayer times (diagnosed, not assumed)
Permissions are granted and the call is correct — `getCurrentPosition` with
`enableHighAccuracy: false`, timeout 12s — and it fails with
`OS-PLUG-GLOC-0010 / Location request timed out`. `adb emu geo fix` injects into
the **GPS provider**, which a low-accuracy (fused/network) request does not
consume, so the fix never arrives no matter how often it is re-sent. The
graceful fallback to Makkah is the designed behaviour working correctly.
**Prayer-time accuracy on Android therefore remains unverifiable without real
hardware** — this is a limitation of the emulator, not a bug in the app.

### Harmless log noise, so nobody chases it twice
`Error injecting safe area CSS: TypeError: Cannot read properties of null` comes
from Capacitor's own `SystemBars.java`, which sets `--safe-area-inset-*` on
`document.documentElement` before the document exists. We never reference those
variables — our CSS uses `env(safe-area-inset-top)`, supplied natively by the
WebView. Nothing of ours depends on it.
