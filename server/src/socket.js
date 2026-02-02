import { Server } from 'socket.io';
import { env, WEBSOCKET_EVENTS } from './config/index.js';

let io = null;

export function setupSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.isDev
        ? [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
        : env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on(WEBSOCKET_EVENTS.SUBSCRIBE_LOGS, () => {
      socket.join('request-logs');
      console.log(`[Socket] ${socket.id} subscribed to request logs`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call setupSocket first.');
  }
  return io;
}

export function emitRequestNew(requestLog) {
  if (io) {
    io.to('request-logs').emit(WEBSOCKET_EVENTS.REQUEST_NEW, requestLog);
  }
}

export function emitRequestComplete(requestLog) {
  if (io) {
    io.to('request-logs').emit(WEBSOCKET_EVENTS.REQUEST_COMPLETE, requestLog);
  }
}

export function emitEndpointsSync(endpoints) {
  if (io) {
    io.emit(WEBSOCKET_EVENTS.ENDPOINTS_SYNC, endpoints);
  }
}
