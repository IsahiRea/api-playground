import './HeadersEditor.css';

const PRESETS = [
  { label: 'JSON Content-Type', key: 'Content-Type', value: 'application/json' },
  { label: 'Bearer Auth', key: 'Authorization', value: 'Bearer ' },
];

export function HeadersEditor({ headers, onChange }) {
  const addHeader = () => {
    onChange([...headers, { id: crypto.randomUUID(), key: '', value: '' }]);
  };

  const removeHeader = (id) => {
    onChange(headers.filter((h) => h.id !== id));
  };

  const updateHeader = (id, field, val) => {
    onChange(headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  };

  const applyPreset = (preset) => {
    const exists = headers.find((h) => h.key === preset.key);
    if (exists) {
      updateHeader(exists.id, 'value', preset.value);
    } else {
      onChange([...headers, { id: crypto.randomUUID(), key: preset.key, value: preset.value }]);
    }
  };

  return (
    <div className="headers-editor">
      <div className="headers-editor__title-row">
        <h3 className="headers-editor__title">Headers</h3>
        <button
          className="headers-editor__add-btn"
          type="button"
          onClick={addHeader}
        >
          + Add
        </button>
      </div>

      <div className="headers-editor__presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="headers-editor__preset"
            type="button"
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="headers-editor__list">
        {headers.map((header) => (
          <div key={header.id} className="headers-editor__row">
            <input
              className="headers-editor__key"
              type="text"
              value={header.key}
              onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
              placeholder="Header name"
            />
            <input
              className="headers-editor__value"
              type="text"
              value={header.value}
              onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
              placeholder="Value"
            />
            <button
              className="headers-editor__remove"
              type="button"
              onClick={() => removeHeader(header.id)}
              aria-label="Remove header"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
