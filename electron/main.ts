import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron';
import path from 'path';

const isDev = !app.isPackaged;
const SERVER_PORT = process.env.PORT || '3000';
const APP_URL = `http://127.0.0.1:${SERVER_PORT}`;

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    title: 'FINCOP — Finansial Ucopp',
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Cegah pembukaan jendela eksternal liar di dalam Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    void mainWindow.loadURL(APP_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  ipcMain.handle('fincop:get-app-info', () => ({
    name: 'FINCOP',
    subtitle: 'FINANSIAL UCOPP',
    version: app.getVersion(),
    platform: process.platform,
    electronVersion: process.versions.electron,
  }));

  ipcMain.handle(
    'fincop:send-notification',
    (_event, payload: { title?: unknown; body?: unknown }) => {
      if (
        !payload ||
        typeof payload.title !== 'string' ||
        typeof payload.body !== 'string' ||
        payload.title.trim().length === 0
      ) {
        return { sent: false, reason: 'Judul atau isi notifikasi tidak valid.' };
      }

      if (!Notification.isSupported()) {
        return { sent: false, reason: 'Sistem operasi tidak mendukung notifikasi desktop.' };
      }

      const notification = new Notification({
        title: payload.title.trim(),
        body: payload.body.trim(),
      });
      notification.show();
      return { sent: true };
    }
  );
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.ucopp.fincop');
  registerIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
