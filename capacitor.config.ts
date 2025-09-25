import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.92b65a33158e41098a11aadacbc98ab1',
  appName: 'bouton-scanner',
  webDir: 'dist',
  server: {
    url: 'https://92b65a33-158e-4109-8a11-aadacbc98ab1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    CapacitorSQLite: {
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite"
      }
    }
  }
};

export default config;