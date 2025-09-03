// src/ui/ToastProvider.js
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const ToastContext = createContext(null);
export const useToasts = () => useContext(ToastContext);

let idSeq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = ++idSeq;
    const t = {
      id,
      type: toast.type || 'info', // success | danger | warning | info
      title: toast.title || '',
      message: toast.message || '',
      timeout: toast.timeout ?? 4000,
    };
    setToasts((prev) => [...prev, t]);
    if (t.timeout > 0) {
      setTimeout(() => removeToast(id), t.timeout);
    }
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} className="toast show border-0 shadow" role="alert">
            <div className={`toast-header bg-${t.type} text-white`}>
              <strong className="me-auto">{t.title || t.type.toUpperCase()}</strong>
              <button
                type="button"
                className="btn-close btn-close-white ms-2 mb-1"
                onClick={() => removeToast(t.id)}
                aria-label="Close"
              />
            </div>
            {t.message && (
              <div className="toast-body">
                {t.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
