import { MethodBadge } from '../../endpoints';
import './RequestLogItem.css';

function formatDuration(ms) {
  if (ms == null) return '...';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function statusCodeClass(code) {
  if (!code) return '';
  if (code < 300) return 'request-log-item__status--success';
  if (code < 400) return 'request-log-item__status--redirect';
  if (code < 500) return 'request-log-item__status--warning';
  return 'request-log-item__status--error';
}

export function RequestLogItem({ log, onSelect }) {
  const isPending = log.status === 'pending';
  const httpStatus = log.response?.status;

  return (
    <button
      className={`request-log-item ${isPending ? 'request-log-item--pending' : ''}`}
      onClick={() => onSelect(log)}
      type="button"
    >
      <MethodBadge method={log.method} />
      <span className="request-log-item__path" title={log.fullPath}>
        {log.path}
      </span>
      <span className="request-log-item__meta">
        {httpStatus && (
          <span className={`request-log-item__status ${statusCodeClass(httpStatus)}`}>
            {httpStatus}
          </span>
        )}
        {isPending && <span className="request-log-item__pending-dot" />}
        <span className="request-log-item__duration">
          {formatDuration(log.duration)}
        </span>
      </span>
    </button>
  );
}
