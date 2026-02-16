import { Send } from 'lucide-react';
import { HTTP_METHODS } from '../../../constants/HTTP_METHODS';
import { API_ENDPOINTS } from '../../../constants/API_ENDPOINTS';
import './RequestForm.css';

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

export function RequestForm({
  method,
  url,
  body,
  onMethodChange,
  onUrlChange,
  onBodyChange,
  onSend,
  isLoading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="request-form__primary">
        <select
          className="request-form__method"
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
          data-method={method.toLowerCase()}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          className="request-form__url"
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={`${API_ENDPOINTS.MOCK_BASE}/your-endpoint`}
          required
        />

        <button
          className="request-form__send"
          type="submit"
          disabled={isLoading || !url.trim()}
        >
          <Send size={16} />
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {METHODS_WITH_BODY.includes(method) && (
        <textarea
          className="request-form__body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder='{"key": "value"}'
          rows={5}
        />
      )}

      <p className="request-form__hint">
        Mock base: <code>{API_ENDPOINTS.MOCK_BASE}</code>
      </p>
    </form>
  );
}
