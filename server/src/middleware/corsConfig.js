import cors from 'cors';
import { env } from '../config/index.js';

// CORS configuration for frontend communication
export const corsMiddleware = cors({
  origin: env.isDev
    ? [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
    : env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
