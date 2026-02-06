// EndpointBuilder - Main endpoint creation/edit form

import { useState, useEffect } from 'react';
import { HTTP_METHODS } from '../../../constants';
import { ResponseEditor } from './ResponseEditor';
import './EndpointBuilder.css';

const DEFAULT_ENDPOINT = {
  name: '',
  method: 'GET',
  path: '',
  response: {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: '{\n  "message": "Hello, World!"\n}',
    delay: 0,
  },
};

export function EndpointBuilder({ endpoint, onSave, onCancel }) {
  const isEditing = Boolean(endpoint?.id);
  const [formData, setFormData] = useState(DEFAULT_ENDPOINT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (endpoint) {
      setFormData({
        ...endpoint,
        response: {
          ...endpoint.response,
          body:
            typeof endpoint.response.body === 'string'
              ? endpoint.response.body
              : JSON.stringify(endpoint.response.body, null, 2),
        },
      });
    } else {
      setFormData(DEFAULT_ENDPOINT);
    }
  }, [endpoint]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResponseChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      response: { ...prev.response, [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Parse body to validate JSON before saving
      let parsedBody;
      try {
        parsedBody = JSON.parse(formData.response.body);
      } catch {
        throw new Error('Response body must be valid JSON');
      }

      const dataToSave = {
        ...formData,
        response: {
          ...formData.response,
          body: parsedBody,
          status: Number(formData.response.status),
          delay: Number(formData.response.delay),
        },
      };

      await onSave(dataToSave);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="endpoint-builder">
      <div className="endpoint-builder__header">
        <h2 className="endpoint-builder__title">
          {isEditing ? 'Edit Endpoint' : 'Create Endpoint'}
        </h2>
        <button
          type="button"
          className="endpoint-builder__close"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <form className="endpoint-builder__form" onSubmit={handleSubmit}>
        <div className="endpoint-builder__field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Get Users"
            required
          />
        </div>

        <div className="endpoint-builder__row">
          <div className="endpoint-builder__field endpoint-builder__field--method">
            <label htmlFor="method">Method</label>
            <select
              id="method"
              value={formData.method}
              onChange={(e) => handleChange('method', e.target.value)}
            >
              {HTTP_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="endpoint-builder__field endpoint-builder__field--path">
            <label htmlFor="path">Path</label>
            <div className="endpoint-builder__path-input">
              <span className="endpoint-builder__path-prefix">/mock</span>
              <input
                id="path"
                type="text"
                value={formData.path}
                onChange={(e) => handleChange('path', e.target.value)}
                placeholder="/users"
                required
              />
            </div>
          </div>
        </div>

        <div className="endpoint-builder__row">
          <div className="endpoint-builder__field">
            <label htmlFor="status">Status Code</label>
            <input
              id="status"
              type="number"
              min="100"
              max="599"
              value={formData.response.status}
              onChange={(e) => handleResponseChange('status', e.target.value)}
            />
          </div>

          <div className="endpoint-builder__field">
            <label htmlFor="delay">Delay (ms)</label>
            <input
              id="delay"
              type="number"
              min="0"
              max="30000"
              value={formData.response.delay}
              onChange={(e) => handleResponseChange('delay', e.target.value)}
            />
          </div>
        </div>

        <div className="endpoint-builder__field">
          <ResponseEditor
            value={formData.response.body}
            onChange={(value) => handleResponseChange('body', value)}
          />
        </div>

        {error && <p className="endpoint-builder__error">{error}</p>}

        <div className="endpoint-builder__actions">
          <button
            type="button"
            className="endpoint-builder__btn endpoint-builder__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="endpoint-builder__btn endpoint-builder__btn--save"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
