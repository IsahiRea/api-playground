// Server constants

export const ROUTE_PREFIX = {
  API: '/api',
  MOCK: '/mock',
};

export const LIMITS = {
  MAX_ENDPOINTS: 100,
  MAX_REQUEST_LOG: 1000,
  MAX_BODY_SIZE: '1mb',
};

export const WEBSOCKET_EVENTS = {
  REQUEST_NEW: 'request:new',
  REQUEST_COMPLETE: 'request:complete',
  ENDPOINTS_SYNC: 'endpoints:sync',
  SUBSCRIBE_LOGS: 'subscribe:logs',
};
