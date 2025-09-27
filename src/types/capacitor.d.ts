declare global {
  interface Window {
    Capacitor?: {
      Plugins: any;
      isNativePlatform(): boolean;
      platform: string;
    };
  }
}

export {};