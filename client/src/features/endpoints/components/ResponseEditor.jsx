// ResponseEditor - JSON editor for response body with Faker template picker and preview

import { useState, useCallback, useRef } from 'react';
import { Wand2, Code, Eye } from 'lucide-react';
import { fakerApi } from '../../../lib/api';
import { FAKER_TEMPLATE_CATEGORIES } from '../../../constants';
import './ResponseEditor.css';

export function ResponseEditor({ value, onChange, placeholder }) {
  const [error, setError] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const textareaRef = useRef(null);

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

  const insertTemplate = useCallback(
    (template) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + template + value.slice(end);
      onChange(newValue);

      // Restore cursor position after the inserted template
      requestAnimationFrame(() => {
        const cursorPos = start + template.length;
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  const handlePreview = useCallback(async () => {
    if (!value.trim()) return;

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);

    try {
      // Try parsing as JSON first, fall back to raw string
      let template;
      try {
        template = JSON.parse(value);
      } catch {
        template = value;
      }

      const data = await fakerApi.preview(template);
      setPreviewData(data.result);
    } catch (err) {
      setPreviewError(err.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  }, [value]);

  return (
    <div className="response-editor">
      <div className="response-editor__header">
        <label className="response-editor__label">Response Body</label>
        <div className="response-editor__actions">
          <button
            type="button"
            className="response-editor__action-btn"
            onClick={() => setShowTemplates((prev) => !prev)}
          >
            <Wand2 size={14} />
            {showTemplates ? 'Hide Templates' : 'Insert Template'}
          </button>
          <button
            type="button"
            className="response-editor__action-btn"
            onClick={formatJson}
          >
            <Code size={14} />
            Format
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="response-editor__templates">
          <div className="response-editor__templates-grid">
            {FAKER_TEMPLATE_CATEGORIES.map((category) => (
              <div key={category.id} className="response-editor__template-category">
                <span className="response-editor__category-label">
                  {category.label}
                </span>
                <div className="response-editor__template-chips">
                  {category.templates.map((t) => (
                    <button
                      key={t.template}
                      type="button"
                      className="response-editor__template-btn"
                      onClick={() => insertTemplate(t.template)}
                      title={t.template}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className={`response-editor__textarea ${error ? 'response-editor__textarea--error' : ''}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || '{\n  "message": "Hello, World!"\n}'}
        spellCheck={false}
      />

      {error && <p className="response-editor__error">{error}</p>}

      <div className="response-editor__footer">
        <p className="response-editor__hint">
          Tip: Use <code>{'{{faker.person.fullName()}}'}</code> for dynamic data
        </p>
        <button
          type="button"
          className="response-editor__preview-btn"
          onClick={handlePreview}
          disabled={previewLoading || !value.trim()}
        >
          <Eye size={14} />
          {previewLoading ? 'Generating...' : 'Preview'}
        </button>
      </div>

      {previewError && (
        <p className="response-editor__preview-error">{previewError}</p>
      )}

      {previewData !== null && (
        <div className="response-editor__preview">
          <pre className="response-editor__preview-content">
            {typeof previewData === 'string'
              ? previewData
              : JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
