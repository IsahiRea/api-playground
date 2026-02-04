// In-memory store for endpoint CRUD operations
import { randomUUID } from 'crypto';
import { LIMITS } from '../config/index.js';

const endpoints = new Map();

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function validateEndpoint(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }
  }

  if (!isUpdate || data.method !== undefined) {
    if (!data.method || !HTTP_METHODS.includes(data.method)) {
      errors.push(`Method must be one of: ${HTTP_METHODS.join(', ')}`);
    }
  }

  if (!isUpdate || data.path !== undefined) {
    if (!data.path || typeof data.path !== 'string') {
      errors.push('Path is required and must be a string');
    } else if (!data.path.startsWith('/')) {
      errors.push('Path must start with /');
    }
  }

  if (data.response !== undefined) {
    if (typeof data.response !== 'object' || data.response === null) {
      errors.push('Response must be an object');
    } else {
      if (data.response.status !== undefined) {
        const status = Number(data.response.status);
        if (isNaN(status) || status < 100 || status > 599) {
          errors.push('Response status must be a valid HTTP status code (100-599)');
        }
      }
      if (data.response.delay !== undefined) {
        const delay = Number(data.response.delay);
        if (isNaN(delay) || delay < 0 || delay > 30000) {
          errors.push('Response delay must be between 0 and 30000ms');
        }
      }
    }
  }

  return errors;
}

function createDefaultResponse() {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { message: 'Mock response' },
    delay: 0,
  };
}

export function getAllEndpoints() {
  return Array.from(endpoints.values());
}

export function getEndpointById(id) {
  return endpoints.get(id) || null;
}

export function createEndpoint(data) {
  const errors = validateEndpoint(data);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (endpoints.size >= LIMITS.MAX_ENDPOINTS) {
    return {
      success: false,
      errors: [`Maximum number of endpoints (${LIMITS.MAX_ENDPOINTS}) reached`],
    };
  }

  const endpoint = {
    id: randomUUID(),
    name: data.name.trim(),
    method: data.method,
    path: data.path.trim(),
    enabled: data.enabled !== false,
    response: {
      ...createDefaultResponse(),
      ...data.response,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Check for duplicate method + path combination
  for (const existing of endpoints.values()) {
    if (existing.method === endpoint.method && existing.path === endpoint.path) {
      return { success: false, errors: ['An endpoint with the same method and path already exists'] };
    }
  }

  endpoints.set(endpoint.id, endpoint);
  return { success: true, endpoint };
}

export function updateEndpoint(id, data) {
  const existing = endpoints.get(id);
  if (!existing) {
    return { success: false, errors: ['Endpoint not found'] };
  }

  const errors = validateEndpoint(data, true);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  const updated = {
    ...existing,
    ...(data.name !== undefined && { name: data.name.trim() }),
    ...(data.method !== undefined && { method: data.method }),
    ...(data.path !== undefined && { path: data.path.trim() }),
    ...(data.enabled !== undefined && { enabled: data.enabled }),
    ...(data.response !== undefined && {
      response: { ...existing.response, ...data.response },
    }),
    updatedAt: new Date().toISOString(),
  };

  endpoints.set(id, updated);
  return { success: true, endpoint: updated };
}

export function deleteEndpoint(id) {
  const existing = endpoints.get(id);
  if (!existing) {
    return { success: false, errors: ['Endpoint not found'] };
  }

  endpoints.delete(id);
  return { success: true, endpoint: existing };
}

export function toggleEndpoint(id) {
  const existing = endpoints.get(id);
  if (!existing) {
    return { success: false, errors: ['Endpoint not found'] };
  }

  const updated = {
    ...existing,
    enabled: !existing.enabled,
    updatedAt: new Date().toISOString(),
  };

  endpoints.set(id, updated);
  return { success: true, endpoint: updated };
}

export function clearAllEndpoints() {
  endpoints.clear();
}

export function findEndpointByMethodAndPath(method, path) {
  for (const endpoint of endpoints.values()) {
    if (endpoint.method === method && endpoint.path === path && endpoint.enabled) {
      return endpoint;
    }
  }
  return null;
}
