import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'critical' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    critical: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    critical: (title: string, message?: string) => addToast({ type: 'critical', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
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

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const config = {
    success: {
      border: 'border-status-success/30',
      bg: 'bg-obsidian-800/95',
      icon: CheckCircle2,
      iconColor: 'text-status-success',
      glow: 'shadow-status-success',
    },
    warning: {
      border: 'border-status-warning/30',
      bg: 'bg-obsidian-800/95',
      icon: AlertTriangle,
      iconColor: 'text-status-warning',
      glow: 'shadow-status-warning',
    },
    critical: {
      border: 'border-status-critical/30',
      bg: 'bg-obsidian-800/95',
      icon: AlertCircle,
      iconColor: 'text-status-critical',
      glow: 'shadow-status-critical',
    },
    info: {
      border: 'border-glacial/30',
      bg: 'bg-obsidian-800/95',
      icon: Info,
      iconColor: 'text-glacial',
      glow: 'shadow-glass-glow',
    },
  }[item.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-glass transition-all",
        "animate-in slide-in-from-right-5 fade-in-0 duration-200",
        config.bg,
        config.border,
        config.glow
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-slate-text">{item.title}</h4>
        {item.message && (
          <p className="text-xs text-slate-muted mt-0.5 leading-relaxed">{item.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-tertiary hover:text-slate-text transition-colors p-1 -mr-1 -mt-1 rounded-md"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

