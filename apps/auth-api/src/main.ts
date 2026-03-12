import express from 'express';
import cors from 'cors';
import { authRouter } from './routes';
import { initKeys } from './jwt-service';
import { eventBus } from '@basenative/identity-domain';

const PORT = parseInt(process.env['PORT'] || '3333', 10);

async function bootstrap(): Promise<void> {
  await initKeys();

  const app = express();

  app.use(
    cors({
      origin: process.env['ORIGIN'] || 'http://localhost:4200',
      credentials: true,
    })
  );
  app.use(express.json());

  // Event bus logger for POC
  eventBus.subscribe((event) => {
    console.log('[IdentityEvent]', JSON.stringify(event));
  });

  app.use('/auth', authRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(PORT, () => {
    console.log(`Auth API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
