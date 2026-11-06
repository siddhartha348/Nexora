import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  telemetryCode?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, telemetryCode, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        <div className="flex items-center justify-between">
          {label && (
            <label 
              htmlFor={generatedId} 
              className="block text-xs font-bold text-ink uppercase tracking-wider"
            >
              {label}
            </label>
          )}
          {telemetryCode && (
            <span className="text-[10px] font-mono text-primary uppercase font-bold">
              // {telemetryCode}
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={generatedId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded-[6px] bg-surface text-sm text-ink placeholder:text-text-muted",
              "border-3 border-ink px-3.5 py-2.5 transition-all duration-150 shadow-neo-sm",
              "hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-severity-red focus-visible:ring-severity-red",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-severity-red font-bold flex items-center gap-1 font-mono">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-text-muted font-mono">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
