import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { proxyApi } from '../../lib/api';

const DEFAULT_HEADERS = [
  { id: crypto.randomUUID(), key: 'Content-Type', value: 'application/json' },
];

export function useApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState(DEFAULT_HEADERS);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const sendRequest = useCallback(async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    clearResponse();

    try {
      const headersObj = {};
      headers.forEach(({ key, value }) => {
        if (key.trim()) {
          headersObj[key] = value;
        }
      });

      const reqBody = ['GET', 'HEAD'].includes(method) ? null : body;

      if (url.startsWith(API_ENDPOINTS.MOCK_BASE)) {
        // Local request — fetch directly (same origin, no proxy needed)
        const startTime = performance.now();
        const res = await fetch(url, {
          method,
          headers: headersObj,
          body: reqBody,
        });
        const timing = Math.round(performance.now() - startTime);

        const resHeaders = {};
        res.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: resHeaders,
          data: await res.text(),
          timing,
        });
      } else {
        // External request — proxy through server to bypass CORS
        const result = await proxyApi.send({
          method,
          url,
          headers: headersObj,
          body: reqBody,
        });

        setResponse({
          status: result.status,
          statusText: result.statusText,
          headers: result.headers,
          data: result.data,
          timing: result.timing,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to send API request');
    } finally {
      setIsLoading(false);
    }
  }, [method, url, headers, body, clearResponse]);

  return {
    method,
    url,
    headers,
    body,
    isLoading,
    response,
    error,
    setMethod,
    setUrl,
    setHeaders,
    setBody,
    sendRequest,
    clearResponse,
  };
}
