// useEndpoints - Hook for endpoint CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { endpointsApi } from '../../lib/api';

export function useEndpoints() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endpointsApi.getAll();
      setEndpoints(data.endpoints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEndpoint = useCallback(async (endpoint) => {
    const data = await endpointsApi.create(endpoint);
    setEndpoints((prev) => [...prev, data.endpoint]);
    return data.endpoint;
  }, []);

  const updateEndpoint = useCallback(async (id, endpoint) => {
    const data = await endpointsApi.update(id, endpoint);
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === id ? data.endpoint : ep))
    );
    return data.endpoint;
  }, []);

  const deleteEndpoint = useCallback(async (id) => {
    await endpointsApi.delete(id);
    setEndpoints((prev) => prev.filter((ep) => ep.id !== id));
  }, []);

  const toggleEndpoint = useCallback(async (id) => {
    const data = await endpointsApi.toggle(id);
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === id ? data.endpoint : ep))
    );
    return data.endpoint;
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  return {
    endpoints,
    loading,
    error,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
  };
}
