import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={cn("w-full space-y-1.5 relative font-sans", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-ink uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between rounded-[6px] bg-surface text-sm px-3.5 py-2.5",
          "border-3 border-ink text-left transition-all duration-150 shadow-neo-sm text-ink",
          "hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-severity-red focus-visible:ring-severity-red",
          isOpen && "shadow-neo"
        )}
      >
        <span className={cn("truncate font-medium", !selectedOption && "text-text-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-ink transition-transform duration-150 shrink-0 ml-2 stroke-[3]",
            isOpen && "rotate-180 text-primary"
          )} 
        />
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className="absolute z-50 w-full mt-1.5 py-1 rounded-[6px] bg-surface shadow-neo-lg border-3 border-ink max-h-60 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "px-3.5 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 select-none",
                  isSelected 
                    ? "bg-primary text-white font-bold" 
                    : "text-ink hover:bg-paper"
                )}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className={cn("text-xs mt-0.5", isSelected ? "text-white/80" : "text-text-muted")}>
                      {option.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 stroke-[3] text-white shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-severity-red font-bold font-mono mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
