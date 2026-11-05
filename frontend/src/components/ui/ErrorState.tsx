import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'card' | 'inline';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Anomaly',
  message,
  onRetry,
  className,
  variant = 'card',
}) => {
  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border border-status-critical/30 bg-status-critical-bg text-xs text-status-critical",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="font-medium underline hover:text-white ml-3 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-status-critical/30 bg-status-critical-bg backdrop-blur-md shadow-status-critical",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-status-critical/20 border border-status-critical/40 flex items-center justify-center text-status-critical mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-status-critical mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-muted max-w-sm mb-5 leading-relaxed font-mono">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Re-evaluate
        </Button>
      )}
    </div>
  );
};
