import React from 'react';
import { cn } from '../../utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <div className={cn("flex items-center justify-between gap-4 font-sans select-none", className)}>
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="block text-sm font-bold text-ink">{label}</span>}
          {description && <span className="block text-xs text-text-muted mt-0.5">{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 border-3 border-ink rounded-full transition-all duration-150 cursor-pointer shadow-neo-sm",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:not(:disabled):-translate-x-[1px] hover:not(:disabled):-translate-y-[1px] hover:not(:disabled):shadow-neo",
          checked ? "bg-primary" : "bg-surface",
          isSm ? "w-10 h-6 p-0.5" : "w-13 h-7 p-0.5"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full border-2 border-ink bg-white shadow-sm transform transition-transform duration-150",
            isSm ? "w-4 h-4" : "w-5 h-5",
            checked
              ? (isSm ? "translate-x-4 bg-accent-yellow" : "translate-x-6 bg-accent-yellow")
              : "translate-x-0 bg-paper"
          )}
        />
      </button>
    </div>
  );
};

