// EndpointList - Container for rendering all endpoint cards

import { EndpointCard } from './EndpointCard';
import './EndpointList.css';

export function EndpointList({
  endpoints,
  loading,
  error,
  onEdit,
  onDelete,
  onToggle,
  onAdd,
  onRetry,
  onImport,
  onExport,
}) {
  if (loading) {
    return (
      <div className="endpoint-list endpoint-list--loading">
        <p>Loading endpoints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="endpoint-list endpoint-list--error">
        <p>Error: {error}</p>
        {onRetry && (
          <button
            type="button"
            className="endpoint-list__retry-btn"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="endpoint-list">
      <div className="endpoint-list__header">
        <h2 className="endpoint-list__title">Mock Endpoints</h2>
        <div className="endpoint-list__toolbar">
          {onImport && (
            <label className="endpoint-list__toolbar-btn endpoint-list__toolbar-btn--secondary">
              Import
              <input
                type="file"
                accept=".json"
                className="endpoint-list__file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                  e.target.value = '';
                }}
              />
            </label>
          )}
          {onExport && endpoints.length > 0 && (
            <button
              type="button"
              className="endpoint-list__toolbar-btn endpoint-list__toolbar-btn--secondary"
              onClick={onExport}
            >
              Export
            </button>
          )}
          <button
            type="button"
            className="endpoint-list__add-btn"
            onClick={onAdd}
          >
            + Add Endpoint
          </button>
        </div>
      </div>

      {endpoints.length === 0 ? (
        <div className="endpoint-list__empty">
          <p>No endpoints yet.</p>
          <p>Create your first mock endpoint to get started.</p>
        </div>
      ) : (
        <div className="endpoint-list__items">
          {endpoints.map((endpoint) => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
