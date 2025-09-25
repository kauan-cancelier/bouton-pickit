declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform(): boolean;
      platform: string;
    };
  }
}

export {};