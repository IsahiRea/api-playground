// Main view: composes EndpointList + RequestLogPanel

import { useState, useCallback } from 'react';
import {
  EndpointList,
  EndpointBuilder,
  useEndpoints,
} from '../features/endpoints';
import './DashboardPage.css';

export function DashboardPage() {
  const {
    endpoints,
    loading,
    error,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
  } = useEndpoints();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);

  const handleAdd = useCallback(() => {
    setEditingEndpoint(null);
    setShowBuilder(true);
  }, []);

  const handleEdit = useCallback((endpoint) => {
    setEditingEndpoint(endpoint);
    setShowBuilder(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowBuilder(false);
    setEditingEndpoint(null);
  }, []);

  const handleSave = useCallback(
    async (data) => {
      if (editingEndpoint) {
        await updateEndpoint(editingEndpoint.id, data);
      } else {
        await createEndpoint(data);
      }
      setShowBuilder(false);
      setEditingEndpoint(null);
    },
    [editingEndpoint, createEndpoint, updateEndpoint]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm('Are you sure you want to delete this endpoint?')) {
        await deleteEndpoint(id);
      }
    },
    [deleteEndpoint]
  );

  return (
    <div className="dashboard">
      <main className="dashboard__main">
        <EndpointList
          endpoints={endpoints}
          loading={loading}
          error={error}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={toggleEndpoint}
        />
      </main>

      {showBuilder && (
        <div className="dashboard__modal-overlay" onClick={handleCancel}>
          <div
            className="dashboard__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <EndpointBuilder
              endpoint={editingEndpoint}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
