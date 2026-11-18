export interface FincopDesktopBridge {
  isElectron: boolean;
  getAppInfo: () => Promise<{
    name: string;
    subtitle: string;
    version: string;
    platform: string;
    electronVersion: string;
  }>;
  sendNotification: (payload: {
    title: string;
    body: string;
  }) => Promise<{ sent: boolean; reason?: string }>;
}

declare global {
  interface Window {
    fincopAPI?: FincopDesktopBridge;
  }
}

export {};
