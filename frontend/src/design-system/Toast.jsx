import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({
    title,
    description,
    type = 'info', // 'success' | 'error' | 'warning' | 'info'
    duration = 4000,
  }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    show: addToast,
    success: (title, description, duration) =>
      addToast({ title, description, type: 'success', duration }),
    error: (title, description, duration) =>
      addToast({ title, description, type: 'error', duration }),
    warning: (title, description, duration) =>
      addToast({ title, description, type: 'warning', duration }),
    info: (title, description, duration) =>
      addToast({ title, description, type: 'info', duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem = ({ toast, onDismiss }) => {
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-200',
      bg: 'bg-white',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-200',
      bg: 'bg-white',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-200',
      bg: 'bg-white',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50',
    },
    info: {
      icon: Info,
      border: 'border-blue-200',
      bg: 'bg-white',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`pointer-events-auto rounded-xl border ${config.border} ${config.bg} p-3.5 shadow-dropdown flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-3 duration-200`}
      role="alert"
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${config.badgeBg} ${config.iconColor}`}>
        <IconComponent size={18} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default ToastProvider;
