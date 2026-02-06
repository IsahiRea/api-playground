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
      </div>
    );
  }

  return (
    <div className="endpoint-list">
      <div className="endpoint-list__header">
        <h2 className="endpoint-list__title">Mock Endpoints</h2>
        <button
          type="button"
          className="endpoint-list__add-btn"
          onClick={onAdd}
        >
          + Add Endpoint
        </button>
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
