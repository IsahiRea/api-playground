// Dynamic Express route registration for mock endpoints
import { Router } from 'express';
import { getAllEndpoints } from './endpointStore.js';
import { processBody } from './fakerService.js';

let mockRouter = Router();

/**
 * Sleep helper for response delays
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a handler for a mock endpoint
 */
function createMockHandler(endpoint) {
  return async (_req, res) => {
    const { response } = endpoint;

    // Apply delay if configured
    if (response.delay && response.delay > 0) {
      await delay(response.delay);
    }

    // Set custom headers
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    // Process body with Faker templates
    let body = response.body;
    if (body !== undefined && body !== null) {
      // If body is a string (raw JSON template), parse and process it
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
          body = processBody(body);
        } catch {
          // If not valid JSON, process as plain string
          body = processBody(body);
        }
      } else {
        // Process object/array body
        body = processBody(body);
      }
    }

    // Send response
    res.status(response.status || 200);

    if (body === undefined || body === null) {
      res.end();
    } else if (typeof body === 'object') {
      res.json(body);
    } else {
      res.send(body);
    }
  };
}

/**
 * Register a single endpoint on the router
 */
function registerEndpoint(router, endpoint) {
  const method = endpoint.method.toLowerCase();
  const handler = createMockHandler(endpoint);

  // Store endpoint ID on the handler for request capture
  handler.endpointId = endpoint.id;
  handler.endpointName = endpoint.name;

  switch (method) {
    case 'get':
      router.get(endpoint.path, handler);
      break;
    case 'post':
      router.post(endpoint.path, handler);
      break;
    case 'put':
      router.put(endpoint.path, handler);
      break;
    case 'patch':
      router.patch(endpoint.path, handler);
      break;
    case 'delete':
      router.delete(endpoint.path, handler);
      break;
    default:
      console.warn(`[MockRouter] Unknown method: ${endpoint.method}`);
  }
}

/**
 * Rebuild the mock router with current endpoints
 * Call this after any endpoint changes
 */
export function rebuildMockRouter() {
  const newRouter = Router();

  const endpoints = getAllEndpoints().filter((ep) => ep.enabled);

  for (const endpoint of endpoints) {
    try {
      registerEndpoint(newRouter, endpoint);
      console.log(`[MockRouter] Registered: ${endpoint.method} ${endpoint.path}`);
    } catch (error) {
      console.error(`[MockRouter] Failed to register ${endpoint.method} ${endpoint.path}:`, error);
    }
  }

  // 404 handler for unmatched mock routes
  newRouter.use((req, res) => {
    res.status(404).json({
      error: 'No mock endpoint found',
      path: req.path,
      method: req.method,
      hint: 'Create an endpoint matching this path and method',
    });
  });

  mockRouter = newRouter;
  console.log(`[MockRouter] Rebuilt with ${endpoints.length} enabled endpoint(s)`);

  return mockRouter;
}

/**
 * Get the current mock router instance
 */
export function getMockRouter() {
  return mockRouter;
}

/**
 * Middleware that delegates to the current mock router
 * This allows hot-swapping the router without changing the Express app
 */
export function mockRouterMiddleware(req, res, next) {
  mockRouter(req, res, next);
}

// Initialize with empty router
rebuildMockRouter();
