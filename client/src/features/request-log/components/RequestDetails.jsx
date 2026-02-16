import { X } from 'lucide-react';
import { MethodBadge } from '../../endpoints';
import './RequestDetails.css';

function formatTimestamp(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
}

function formatJson(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
  }
  return JSON.stringify(value, null, 2);
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="request-details__section">
      <h3 className="request-details__section-title">{title}</h3>
      {children}
    </div>
  );
}

function KeyValueTable({ data }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="request-details__kv-table">
      {Object.entries(data).map(([key, value]) => (
        <div className="request-details__kv-row" key={key}>
          <span className="request-details__kv-key">{key}</span>
          <span className="request-details__kv-value">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RequestDetails({ log, onClose }) {
  if (!log) return null;

  const hasQuery = log.query && Object.keys(log.query).length > 0;
  const hasHeaders = log.headers && Object.keys(log.headers).length > 0;
  const hasBody = log.body != null && Object.keys(log.body).length > 0;
  const hasResponse = log.response != null;

  return (
    <div className="request-details__overlay" onClick={onClose}>
      <div className="request-details" onClick={(e) => e.stopPropagation()}>
        <div className="request-details__header">
          <div className="request-details__header-info">
            <MethodBadge method={log.method} />
            <span className="request-details__path">{log.fullPath || log.path}</span>
          </div>
          <button className="request-details__close" onClick={onClose} type="button" aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <div className="request-details__body">
          <Section title="Request Info">
            <div className="request-details__info-grid">
              <div className="request-details__info-item">
                <span className="request-details__info-label">Timestamp</span>
                <span className="request-details__info-value">{formatTimestamp(log.timestamp)}</span>
              </div>
              <div className="request-details__info-item">
                <span className="request-details__info-label">Duration</span>
                <span className="request-details__info-value">
                  {log.duration != null ? `${Math.round(log.duration)}ms` : 'Pending...'}
                </span>
              </div>
              <div className="request-details__info-item">
                <span className="request-details__info-label">Status</span>
                <span className="request-details__info-value">
                  {hasResponse ? log.response.status : log.status}
                </span>
              </div>
              <div className="request-details__info-item">
                <span className="request-details__info-label">Client IP</span>
                <span className="request-details__info-value">{log.ip || '—'}</span>
              </div>
            </div>
          </Section>

          {hasHeaders && (
            <Section title="Request Headers">
              <KeyValueTable data={log.headers} />
            </Section>
          )}

          {hasQuery && (
            <Section title="Query Parameters">
              <KeyValueTable data={log.query} />
            </Section>
          )}

          {hasBody && (
            <Section title="Request Body">
              <pre className="request-details__code">{formatJson(log.body)}</pre>
            </Section>
          )}

          {hasResponse && (
            <Section title="Response">
              <div className="request-details__response-status">
                Status: <strong>{log.response.status}</strong>
              </div>
              {log.response.body != null && (
                <pre className="request-details__code">{formatJson(log.response.body)}</pre>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
