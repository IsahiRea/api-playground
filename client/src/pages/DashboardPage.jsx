import { useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { useToast } from '../shared/components';
import { endpointsApi } from '../lib/api';
import {
  EndpointList,
  EndpointBuilder,
  useEndpoints,
  exportEndpoints,
  validateImportData,
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
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
  } = useEndpoints();

  const { addToast } = useToast();
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
      try {
        if (editingEndpoint) {
          await updateEndpoint(editingEndpoint.id, data);
          addToast('success', 'Endpoint updated');
        } else {
          await createEndpoint(data);
          addToast('success', 'Endpoint created');
        }
        setShowBuilder(false);
        setEditingEndpoint(null);
      } catch (err) {
        addToast('error', err.message || 'Failed to save endpoint');
      }
    },
    [editingEndpoint, createEndpoint, updateEndpoint, addToast]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm('Are you sure you want to delete this endpoint?')) {
        try {
          await deleteEndpoint(id);
          addToast('success', 'Endpoint deleted');
        } catch (err) {
          addToast('error', err.message || 'Failed to delete endpoint');
        }
      }
    },
    [deleteEndpoint, addToast]
  );

  const handleToggle = useCallback(
    async (id) => {
      try {
        const ep = await toggleEndpoint(id);
        addToast('info', `Endpoint ${ep.enabled ? 'enabled' : 'disabled'}`);
      } catch (err) {
        addToast('error', err.message || 'Failed to toggle endpoint');
      }
    },
    [toggleEndpoint, addToast]
  );

  const handleExport = useCallback(() => {
    exportEndpoints(endpoints);
    addToast('success', `Exported ${endpoints.length} endpoint(s)`);
  }, [endpoints, addToast]);

  const handleImport = useCallback(
    async (file) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = validateImportData(data);

        if (!result.valid) {
          addToast('error', result.error);
          return;
        }

        const response = await endpointsApi.import(result.endpoints);
        await fetchEndpoints();

        if (response.errors.length > 0) {
          addToast('info', `Imported ${response.created.length}, ${response.errors.length} failed`);
        } else {
          addToast('success', `Imported ${response.created.length} endpoint(s)`);
        }
      } catch (err) {
        addToast('error', err.message || 'Failed to import endpoints');
      }
    },
    [addToast, fetchEndpoints]
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
          onToggle={handleToggle}
          onRetry={fetchEndpoints}
          onImport={handleImport}
          onExport={handleExport}
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
        <Activity size={20} />
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
