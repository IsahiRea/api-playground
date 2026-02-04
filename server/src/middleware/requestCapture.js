// Middleware to capture and log all incoming requests to /mock/*
import { randomUUID } from 'crypto';
import { emitRequestNew, emitRequestComplete } from '../socket.js';
import { LIMITS } from '../config/index.js';

// In-memory store for request logs (circular buffer)
const requestLogs = [];

/**
 * Sanitize headers - remove sensitive values
 */
function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key'];

  for (const key of sensitiveKeys) {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Truncate body if too large
 */
function truncateBody(body, maxLength = 10000) {
  if (!body) return body;

  const str = typeof body === 'string' ? body : JSON.stringify(body);
  if (str.length > maxLength) {
    return {
      _truncated: true,
      _originalLength: str.length,
      preview: str.slice(0, maxLength),
    };
  }

  return body;
}

/**
 * Get all request logs
 */
export function getRequestLogs() {
  return [...requestLogs];
}

/**
 * Clear all request logs
 */
export function clearRequestLogs() {
  requestLogs.length = 0;
}

/**
 * Request capture middleware
 * Captures incoming requests and emits Socket.io events
 */
export function requestCaptureMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = randomUUID();

  // Create initial request log entry
  const requestLog = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    fullPath: req.originalUrl,
    headers: sanitizeHeaders(req.headers),
    query: req.query,
    body: truncateBody(req.body),
    params: req.params,
    ip: req.ip || req.connection?.remoteAddress,
    response: null,
    duration: null,
    endpointId: null,
    status: 'pending',
  };

  // Emit request:new event immediately
  emitRequestNew(requestLog);

  // Store original methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalEnd = res.end.bind(res);

  // Flag to prevent double-completion
  let completed = false;

  function completeRequest(responseBody) {
    if (completed) return;
    completed = true;

    const duration = Date.now() - startTime;

    // Update request log with response data
    requestLog.duration = duration;
    requestLog.status = 'completed';
    requestLog.response = {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: truncateBody(responseBody),
    };

    // Add to circular buffer
    requestLogs.push(requestLog);
    if (requestLogs.length > LIMITS.MAX_REQUEST_LOG) {
      requestLogs.shift();
    }

    // Emit request:complete event
    emitRequestComplete(requestLog);
  }

  // Intercept res.json()
  res.json = function (body) {
    completeRequest(body);
    return originalJson(body);
  };

  // Intercept res.send()
  res.send = function (body) {
    completeRequest(body);
    return originalSend(body);
  };

  // Intercept res.end() for empty responses
  res.end = function (chunk, encoding) {
    completeRequest(chunk);
    return originalEnd(chunk, encoding);
  };

  next();
}
