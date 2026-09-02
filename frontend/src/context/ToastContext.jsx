import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          let bg = '#0F172A';
          let border = 'rgba(255, 255, 255, 0.15)';
          let Icon = Info;
          let iconColor = '#06B6D4';

          if (toast.type === 'success') {
            bg = 'rgba(16, 185, 129, 0.15)';
            border = 'rgba(16, 185, 129, 0.4)';
            Icon = CheckCircle2;
            iconColor = '#10B981';
          } else if (toast.type === 'error') {
            bg = 'rgba(244, 63, 94, 0.15)';
            border = 'rgba(244, 63, 94, 0.4)';
            Icon = AlertCircle;
            iconColor = '#F43F5E';
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bg,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'auto',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', flex: 1, fontWeight: 500 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
