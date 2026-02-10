// /api/faker routes - Template preview endpoint
import { Router } from 'express';
import { processBody, getAvailableFakerMethods } from '../services/fakerService.js';

const router = Router();

// POST /api/faker/preview - Preview faker template output
router.post('/preview', (req, res) => {
  const { template } = req.body;

  if (template === undefined || template === null) {
    return res.status(400).json({ error: 'Template is required' });
  }

  try {
    const result = processBody(template);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process template: ' + err.message });
  }
});

// GET /api/faker/methods - List available faker methods
router.get('/methods', (_req, res) => {
  const methods = getAvailableFakerMethods();
  res.json({ methods });
});

export default router;
