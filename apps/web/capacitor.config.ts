import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hiddenhiqmah.app',
  appName: 'Hidden Hiqmah',
  webDir: 'out',
  ios: {
    contentInset: 'never',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#000000',
      overlaysWebView: true,
    },
  },
};

export default config;
