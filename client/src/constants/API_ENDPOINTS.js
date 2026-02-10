// API route strings: /api/endpoints, /api/faker/preview, /mock

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Endpoint management
  ENDPOINTS: `${API_BASE}/api/endpoints`,
  ENDPOINT: (id) => `${API_BASE}/api/endpoints/${id}`,
  TOGGLE_ENDPOINT: (id) => `${API_BASE}/api/endpoints/${id}/toggle`,

  // Faker
  FAKER_PREVIEW: `${API_BASE}/api/faker/preview`,
  FAKER_METHODS: `${API_BASE}/api/faker/methods`,

  // Mock server base
  MOCK_BASE: `${API_BASE}/mock`,
};
