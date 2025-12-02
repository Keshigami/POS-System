import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.keshigami.pos',
  appName: 'POS System',
  webDir: 'public',
  server: {
    url: 'http://10.0.2.2:3000', // Special alias for localhost in Android Emulator
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
