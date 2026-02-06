// ResponseEditor - JSON editor for response body with Faker template hints

import { useState, useCallback } from 'react';
import './ResponseEditor.css';

export function ResponseEditor({ value, onChange, placeholder }) {
  const [error, setError] = useState(null);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange(newValue);
      setError(null);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    if (!value.trim()) {
      setError(null);
      return;
    }

    try {
      JSON.parse(value);
      setError(null);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  }, [value]);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError('Cannot format: Invalid JSON');
    }
  }, [value, onChange]);

  return (
    <div className="response-editor">
      <div className="response-editor__header">
        <label className="response-editor__label">Response Body</label>
        <button
          type="button"
          className="response-editor__format-btn"
          onClick={formatJson}
        >
          Format
        </button>
      </div>

      <textarea
        className={`response-editor__textarea ${error ? 'response-editor__textarea--error' : ''}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || '{\n  "message": "Hello, World!"\n}'}
        spellCheck={false}
      />

      {error && <p className="response-editor__error">{error}</p>}

      <p className="response-editor__hint">
        Tip: Use <code>{'{{faker.person.fullName()}}'}</code> for dynamic data
      </p>
    </div>
  );
}
