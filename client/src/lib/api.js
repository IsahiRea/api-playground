// API client for communicating with the backend

import { API_ENDPOINTS } from '../constants/API_ENDPOINTS';

class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data.errors || []
    );
  }

  return data;
}

// Endpoint CRUD operations
export const endpointsApi = {
  getAll: () => request(API_ENDPOINTS.ENDPOINTS),

  getById: (id) => request(API_ENDPOINTS.ENDPOINT(id)),

  create: (endpoint) =>
    request(API_ENDPOINTS.ENDPOINTS, {
      method: 'POST',
      body: endpoint,
    }),

  update: (id, endpoint) =>
    request(API_ENDPOINTS.ENDPOINT(id), {
      method: 'PUT',
      body: endpoint,
    }),

  delete: (id) =>
    request(API_ENDPOINTS.ENDPOINT(id), {
      method: 'DELETE',
    }),

  toggle: (id) =>
    request(API_ENDPOINTS.TOGGLE_ENDPOINT(id), {
      method: 'POST',
    }),
};

// Faker preview
export const fakerApi = {
  preview: (template) =>
    request(API_ENDPOINTS.FAKER_PREVIEW, {
      method: 'POST',
      body: { template },
    }),

  methods: () => request(API_ENDPOINTS.FAKER_METHODS),
};

// Proxy — forward requests through the server
export const proxyApi = {
  send: (config) =>
    request(API_ENDPOINTS.PROXY, { method: 'POST', body: config }),
};

export { ApiError };
