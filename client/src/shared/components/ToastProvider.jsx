import { useReducer, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { ToastContext } from './toastContext';
import './Toast.css';

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

function Toast({ toast, onDismiss }) {
  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <span className="toast__message">{toast.message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((type, message) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', toast: { id, type, message } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), AUTO_DISMISS_MS);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
