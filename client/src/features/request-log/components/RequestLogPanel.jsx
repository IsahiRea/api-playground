import { useEffect, useRef } from 'react';
import { RequestLogItem } from './RequestLogItem';
import './RequestLogPanel.css';

export function RequestLogPanel({ logs, connected, onSelect, onClear, onClose }) {
  const listRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    // Auto-scroll if user is within 50px of the top (newest items are prepended)
    shouldAutoScroll.current = el.scrollTop < 50;
  }

  useEffect(() => {
    if (shouldAutoScroll.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <aside className="request-log-panel">
      <div className="request-log-panel__header">
        <div className="request-log-panel__title-row">
          <h2 className="request-log-panel__title">Request Log</h2>
          <span className={`request-log-panel__status ${connected ? 'request-log-panel__status--connected' : 'request-log-panel__status--disconnected'}`}
            title={connected ? 'Connected' : 'Disconnected'}
          />
          <span className="request-log-panel__count">{logs.length}</span>
        </div>
        <div className="request-log-panel__actions">
          {logs.length > 0 && (
            <button className="request-log-panel__clear" onClick={onClear} type="button">
              Clear
            </button>
          )}
          <button className="request-log-panel__close" onClick={onClose} type="button" aria-label="Close panel">
            &times;
          </button>
        </div>
      </div>

      <div className="request-log-panel__list" ref={listRef} onScroll={handleScroll}>
        {logs.length === 0 ? (
          <div className="request-log-panel__empty">
            <p>No requests yet</p>
            <p className="request-log-panel__empty-hint">
              Hit a <code>/mock/*</code> endpoint to see requests appear here in real-time.
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <RequestLogItem key={log.id} log={log} onSelect={onSelect} />
          ))
        )}
      </div>
    </aside>
  );
}
