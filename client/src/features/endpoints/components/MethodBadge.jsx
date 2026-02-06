// MethodBadge - Color-coded HTTP method indicator (GET, POST, PUT, DELETE, etc.)

import { METHOD_COLORS } from '../../../constants';
import './MethodBadge.css';

export function MethodBadge({ method }) {
  const color = METHOD_COLORS[method] || 'var(--color-neutral-500)';

  return (
    <span
      className="method-badge"
      style={{ '--method-color': color }}
    >
      {method}
    </span>
  );
}
