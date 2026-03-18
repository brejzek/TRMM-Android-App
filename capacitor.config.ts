import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tacticalrmm.app',
  appName: 'TacticalRMM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost'

  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
