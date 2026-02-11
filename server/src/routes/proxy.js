import { Router } from 'express';

const router = Router();

// POST / — forward an HTTP request to an external URL
router.post('/', async (req, res) => {
  const { method = 'GET', url, headers = {}, body } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const fetchOptions = {
    method,
    headers,
    signal: AbortSignal.timeout(10_000),
  };

  // Attach body for methods that support it
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    fetchOptions.body = body;
  }

  const start = Date.now();

  try {
    const response = await fetch(url, fetchOptions);
    const timing = Date.now() - start;
    const data = await response.text();

    // Collect response headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      timing,
    });
  } catch (err) {
    const timing = Date.now() - start;

    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Request timed out (10s)', timing });
    }

    res.status(502).json({
      error: err.message || 'Failed to reach the server',
      timing,
    });
  }
});

export default router;
