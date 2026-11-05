import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label 
            htmlFor={generatedId} 
            className="block text-xs font-medium text-slate-muted tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-tertiary pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={generatedId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded-lg bg-obsidian-800/90 text-sm text-slate-text placeholder:text-slate-tertiary",
              "border border-slate-tertiary/30 px-3.5 py-2 transition-all duration-200",
              "hover:border-glacial/30 focus:border-glacial focus:ring-1 focus:ring-glacial/40 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-status-critical focus:border-status-critical focus:ring-status-critical/30",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-tertiary flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-status-critical flex items-center gap-1 font-mono">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-slate-tertiary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

