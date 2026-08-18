import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.hiddenhiqmah.app',
  appName: 'Hiqmah',
  webDir: 'out',
  // WebView background — eliminates the white flash between splash and first paint
  backgroundColor: '#000000',
  ios: {
    contentInset: 'never',
    backgroundColor: '#000000',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#000000',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    // Android only (both keys are ignored on iOS, which uses the app icon).
    // The adhan and the daily verse are LOCAL notifications, so they don't go
    // through FCM and don't pick up the firebase default_notification_icon
    // meta-data in AndroidManifest.xml — without this they'd show the same
    // white square, and the adhan would look broken next to a correct push.
    LocalNotifications: {
      smallIcon: 'ic_stat_hiqmah',
      iconColor: '#D4A843',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
