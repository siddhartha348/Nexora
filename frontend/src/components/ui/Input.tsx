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
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label 
              htmlFor={generatedId} 
              className="block text-xs font-bold text-slate-text uppercase tracking-wider"
            >
              {label}
            </label>
          )}
          {telemetryCode && (
            <span className="text-[10px] font-mono text-glacial uppercase font-bold">
              // {telemetryCode}
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={generatedId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded bg-obsidian-900 text-sm text-slate-text placeholder:text-slate-tertiary",
              "border-2 border-slate-border px-3.5 py-2 transition-all duration-150 shadow-neo-sm",
              "hover:border-glacial focus:border-glacial focus:shadow-neo-accent-sm focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-status-critical focus:border-status-critical focus:shadow-neo-critical",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-status-critical font-bold flex items-center gap-1 font-mono">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-slate-tertiary font-mono">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
