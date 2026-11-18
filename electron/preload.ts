import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopNotificationPayload {
  title: string;
  body: string;
}

export interface FincopDesktopBridge {
  isElectron: boolean;
  getAppInfo: () => Promise<{
    name: string;
    subtitle: string;
    version: string;
    platform: string;
    electronVersion: string;
  }>;
  sendNotification: (payload: DesktopNotificationPayload) => Promise<{ sent: boolean; reason?: string }>;
}

const api: FincopDesktopBridge = {
  isElectron: true,
  getAppInfo: () => ipcRenderer.invoke('fincop:get-app-info'),
  sendNotification: (payload) => {
    if (
      !payload ||
      typeof payload.title !== 'string' ||
      typeof payload.body !== 'string' ||
      payload.title.trim().length === 0
    ) {
      return Promise.resolve({ sent: false, reason: 'Payload notifikasi tidak valid.' });
    }
    return ipcRenderer.invoke('fincop:send-notification', {
      title: payload.title.slice(0, 120),
      body: payload.body.slice(0, 300),
    });
  },
};

contextBridge.exposeInMainWorld('fincopAPI', api);
