// /api/endpoints routes - CRUD operations for mock endpoints
import { Router } from 'express';
import {
  getAllEndpoints,
  getEndpointById,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  toggleEndpoint,
} from '../services/endpointStore.js';
import { rebuildMockRouter } from '../services/mockRouter.js';
import { emitEndpointsSync } from '../socket.js';

const router = Router();

// Helper to broadcast endpoint changes and rebuild mock router
function broadcastEndpoints() {
  rebuildMockRouter();
  emitEndpointsSync(getAllEndpoints());
}

// GET /api/endpoints - List all endpoints
router.get('/', (_req, res) => {
  const endpoints = getAllEndpoints();
  res.json({ endpoints });
});

// GET /api/endpoints/:id - Get single endpoint
router.get('/:id', (req, res) => {
  const endpoint = getEndpointById(req.params.id);

  if (!endpoint) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  res.json({ endpoint });
});

// POST /api/endpoints - Create new endpoint
router.post('/', (req, res) => {
  const result = createEndpoint(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }

  broadcastEndpoints();
  res.status(201).json({ endpoint: result.endpoint });
});

// PUT /api/endpoints/:id - Update endpoint
router.put('/:id', (req, res) => {
  const result = updateEndpoint(req.params.id, req.body);

  if (!result.success) {
    const status = result.errors.includes('Endpoint not found') ? 404 : 400;
    return res.status(status).json({ errors: result.errors });
  }

  broadcastEndpoints();
  res.json({ endpoint: result.endpoint });
});

// DELETE /api/endpoints/:id - Delete endpoint
router.delete('/:id', (req, res) => {
  const result = deleteEndpoint(req.params.id);

  if (!result.success) {
    return res.status(404).json({ errors: result.errors });
  }

  broadcastEndpoints();
  res.json({ message: 'Endpoint deleted', endpoint: result.endpoint });
});

// POST /api/endpoints/:id/toggle - Toggle endpoint enabled state
router.post('/:id/toggle', (req, res) => {
  const result = toggleEndpoint(req.params.id);

  if (!result.success) {
    return res.status(404).json({ errors: result.errors });
  }

  broadcastEndpoints();
  res.json({ endpoint: result.endpoint });
});

export default router;
