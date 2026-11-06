import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, disabled, onChange, ...props }, ref) => {
    const generatedId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-start gap-3 select-none font-sans">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={generatedId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded-[4px] border-3 border-ink bg-surface shadow-neo-sm transition-all duration-150 flex items-center justify-center cursor-pointer",
              "peer-focus-visible:ring-3 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              "peer-checked:bg-primary peer-checked:text-white",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "hover:peer-enabled:-translate-x-[1px] hover:peer-enabled:-translate-y-[1px] hover:peer-enabled:shadow-neo",
              error && "border-severity-red",
              className
            )}
            onClick={() => {
              if (!disabled && onChange) {
                const event = {
                  target: { checked: !checked },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }
            }}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
          </div>
        </div>

        {(label || description) && (
          <label htmlFor={generatedId} className={cn("cursor-pointer", disabled && "cursor-not-allowed opacity-50")}>
            {label && <span className="block text-sm font-bold text-ink leading-tight">{label}</span>}
            {description && <span className="block text-xs text-text-muted mt-0.5">{description}</span>}
            {error && <span className="block text-xs text-severity-red font-bold mt-0.5">{error}</span>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

