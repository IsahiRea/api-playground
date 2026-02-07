import { useState, useCallback } from 'react';
import {
  EndpointList,
  EndpointBuilder,
  useEndpoints,
} from '../features/endpoints';
import {
  RequestLogPanel,
  RequestDetails,
  useRequestLog,
  useWebSocket,
} from '../features/request-log';
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

  const { connected } = useWebSocket();
  const { logs, selectedLog, clearLogs, selectLog, closeDetails } = useRequestLog();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [showLogPanel, setShowLogPanel] = useState(false);

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

      {/* Desktop: always visible sidebar. Mobile: overlay panel */}
      <div className={`dashboard__sidebar ${showLogPanel ? 'dashboard__sidebar--open' : ''}`}>
        {showLogPanel && (
          <div
            className="dashboard__sidebar-backdrop"
            onClick={() => setShowLogPanel(false)}
          />
        )}
        <RequestLogPanel
          logs={logs}
          connected={connected}
          onSelect={selectLog}
          onClear={clearLogs}
          onClose={() => setShowLogPanel(false)}
        />
      </div>

      {/* Mobile floating action button */}
      <button
        className="dashboard__log-fab"
        onClick={() => setShowLogPanel(true)}
        type="button"
        aria-label="Open request log"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 4h14M3 8h14M3 12h10M3 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {logs.length > 0 && (
          <span className="dashboard__log-fab-badge">{logs.length}</span>
        )}
      </button>

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

      {selectedLog && (
        <RequestDetails log={selectedLog} onClose={closeDetails} />
      )}
    </div>
  );
}
