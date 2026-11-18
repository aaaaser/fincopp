import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app';
import { disconnectDatabase } from './server/config/database';
import { env } from './server/config/env';

async function startServer(): Promise<void> {
  const app = createExpressApp();
  const isProduction = env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[FINCOP] Server berjalan di http://127.0.0.1:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void startServer();
