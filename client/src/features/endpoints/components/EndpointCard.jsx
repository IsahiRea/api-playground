// EndpointCard - Displays a single endpoint with toggle/edit/delete actions

import { MethodBadge } from './MethodBadge';
import './EndpointCard.css';

export function EndpointCard({ endpoint, onEdit, onDelete, onToggle }) {
  const { id, name, method, path, enabled } = endpoint;

  return (
    <div className={`endpoint-card ${enabled ? '' : 'endpoint-card--disabled'}`}>
      <div className="endpoint-card__header">
        <MethodBadge method={method} />
        <code className="endpoint-card__path">/mock{path}</code>
      </div>

      <div className="endpoint-card__body">
        <span className="endpoint-card__name">{name}</span>
      </div>

      <div className="endpoint-card__actions">
        <label className="endpoint-card__toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => onToggle(id)}
          />
          <span className="endpoint-card__toggle-label">
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>

        <div className="endpoint-card__buttons">
          <button
            type="button"
            className="endpoint-card__btn endpoint-card__btn--edit"
            onClick={() => onEdit(endpoint)}
            aria-label={`Edit ${name}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="endpoint-card__btn endpoint-card__btn--delete"
            onClick={() => onDelete(id)}
            aria-label={`Delete ${name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
