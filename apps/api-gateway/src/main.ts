import express, { Express, Response } from 'express';
import { ExtendedRequest } from './types';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import authRoutes from './routes/auth.routes';
import leadsRoutes from './routes/leads.routes';
import dealsRoutes from './routes/deals.routes';
import treasuryRoutes from './routes/treasury.routes';
import documentsRoutes from './routes/documents.routes';

const app: Express = express();
const port = process.env['PORT'] || 3000;

// Middleware
app.use(
  express.json({
    limit: '10mb',
  })
);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:4300',
    'http://localhost:4400',
    'http://localhost:4500',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Custom middlewares
app.use(tenantMiddleware);
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (_req: ExtendedRequest, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/documents', documentsRoutes);

// 404 handler
app.use((_req: ExtendedRequest, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: _req.path,
  });
});

// Error handler
app.use((err: Error, _req: ExtendedRequest, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined,
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`API Gateway listening on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
