import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/health.routes';
import ledgerRoutes from './routes/ledger.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApiRouter(): express.Router {
  const apiRouter = express.Router();
  apiRouter.use(healthRoutes);
  apiRouter.use(ledgerRoutes);
  apiRouter.use(notFoundHandler);
  return apiRouter;
}

export function createExpressApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
      credentials: false,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', createApiRouter());
  app.use(errorHandler);

  return app;
}
