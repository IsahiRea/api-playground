import { useState } from 'react';
import './ResponseViewer.css';

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'response-viewer__status--success';
  if (status >= 300 && status < 500) return 'response-viewer__status--warning';
  return 'response-viewer__status--error';
}

function formatBody(data) {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return data;
  }
}

export function ResponseViewer({ response, error, isLoading }) {
  const [activeTab, setActiveTab] = useState('body');

  // Empty state
  if (!response && !error && !isLoading) {
    return (
      <div className="response-viewer response-viewer--empty">
        <p className="response-viewer__placeholder">
          Send a request to see the response
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="response-viewer response-viewer--loading">
        <div className="response-viewer__spinner" />
        <p className="response-viewer__loading-text">Sending request...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="response-viewer response-viewer--error">
        <p className="response-viewer__error-text">{error}</p>
      </div>
    );
  }

  // Success state
  const headerEntries = response.headers ? Object.entries(response.headers) : [];

  return (
    <div className="response-viewer">
      <div className="response-viewer__status-bar">
        <span className={`response-viewer__status ${getStatusClass(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="response-viewer__timing">{response.timing}ms</span>
      </div>

      <div className="response-viewer__tabs">
        <button
          className={`response-viewer__tab ${activeTab === 'body' ? 'response-viewer__tab--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('body')}
        >
          Body
        </button>
        <button
          className={`response-viewer__tab ${activeTab === 'headers' ? 'response-viewer__tab--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('headers')}
        >
          Headers ({headerEntries.length})
        </button>
      </div>

      <div className="response-viewer__content">
        {activeTab === 'body' && (
          <pre className="response-viewer__body">{formatBody(response.data)}</pre>
        )}

        {activeTab === 'headers' && (
          <table className="response-viewer__headers-table">
            <tbody>
              {headerEntries.map(([key, value]) => (
                <tr key={key}>
                  <td className="response-viewer__header-key">{key}</td>
                  <td className="response-viewer__header-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
