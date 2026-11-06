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
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none font-sans"
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
      tag: 'SUCCESS',
      tagBg: 'bg-severity-green text-white',
      icon: CheckCircle2,
      iconColor: 'text-severity-green',
    },
    warning: {
      tag: 'WARNING',
      tagBg: 'bg-accent-yellow text-ink',
      icon: AlertTriangle,
      iconColor: 'text-accent-yellow',
    },
    critical: {
      tag: 'CRITICAL',
      tagBg: 'bg-severity-red text-white',
      icon: AlertCircle,
      iconColor: 'text-severity-red',
    },
    info: {
      tag: 'INFO',
      tagBg: 'bg-primary text-white',
      icon: Info,
      iconColor: 'text-primary',
    },
  }[item.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 border-3 border-ink rounded-[6px] shadow-neo-lg transition-all bg-surface",
        "animate-in slide-in-from-right-5 fade-in-0 duration-150"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5 stroke-[2.5]", config.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded-[3px] border border-ink uppercase", config.tagBg)}>
            {config.tag}
          </span>
          <h4 className="text-xs font-bold text-ink truncate">{item.title}</h4>
        </div>
        {item.message && (
          <p className="text-xs text-text-muted leading-relaxed break-words">{item.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-ink transition-colors p-1 -mr-1 -mt-1 rounded-[4px] cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
