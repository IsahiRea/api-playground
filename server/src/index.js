import express from 'express';
import { createServer } from 'http';
import { env, ROUTE_PREFIX, LIMITS } from './config/index.js';
import { corsMiddleware } from './middleware/index.js';
import { setupSocket } from './socket.js';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
setupSocket(httpServer);

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: LIMITS.MAX_BODY_SIZE }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes placeholder (implemented in Phase 2)
app.use(ROUTE_PREFIX.API, (_req, _res, next) => {
  // Routes will be mounted here in Phase 2
  next();
});

// Mock routes placeholder (implemented in Phase 2)
app.use(ROUTE_PREFIX.MOCK, (req, res) => {
  res.status(404).json({
    error: 'No mock endpoint found',
    path: req.path,
    method: req.method,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: env.isDev ? err.message : 'Internal server error',
  });
});

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║           API Playground Server                  ║
╠══════════════════════════════════════════════════╣
║  Server:    http://localhost:${env.PORT}               ║
║  Client:    ${env.CLIENT_URL}            ║
║  Mode:      ${env.NODE_ENV.padEnd(30)}║
╚══════════════════════════════════════════════════╝
  `);
});
