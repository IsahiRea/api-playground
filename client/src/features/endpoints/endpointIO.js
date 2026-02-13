// Endpoint import/export utilities

/**
 * Export endpoints as a downloadable JSON file.
 * Strips server-generated fields (id, createdAt, updatedAt) so the
 * file is portable across different API Playground instances.
 */
export function exportEndpoints(endpoints) {
  const stripped = endpoints.map((ep) => {
    const { id, createdAt, updatedAt, ...rest } = ep;
    void id, createdAt, updatedAt;
    return rest;
  });
  const blob = new Blob(
    [JSON.stringify({ endpoints: stripped }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'api-playground-endpoints.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate imported endpoint data shape before sending to server.
 *
 * @param {unknown} data - The parsed JSON from the uploaded file
 * @returns {{ valid: boolean, endpoints?: object[], error?: string }}
 */
export function validateImportData(data) {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid file format: expected an object.' };
  }
  if (!Array.isArray(data.endpoints)) {
    return { valid: false, error: 'Invalid file format: missing "endpoints" array.' };
  }
  
  // Additional validation can be added here (e.g., check required fields in each endpoint)
  return { valid: true, endpoints: data.endpoints };
}
