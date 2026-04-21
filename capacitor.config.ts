import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.focusengine.app',
  appName: 'Focus Engine',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
