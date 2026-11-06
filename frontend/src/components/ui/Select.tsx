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
    <div className={cn("w-full space-y-1.5 relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-muted tracking-wide">
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
          "w-full flex items-center justify-between rounded bg-obsidian-900 text-sm px-3.5 py-2",
          "border-2 border-slate-border text-left transition-all duration-150 shadow-neo-sm",
          "hover:border-glacial focus:border-glacial focus:shadow-neo-accent-sm focus:outline-none",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-status-critical focus:border-status-critical focus:shadow-neo-critical",
          isOpen && "border-glacial shadow-neo-accent-sm"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-tertiary")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-slate-tertiary transition-transform duration-150 shrink-0 ml-2",
            isOpen && "rotate-180 text-glacial"
          )} 
        />
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className="absolute z-50 w-full mt-1.5 py-1 rounded bg-obsidian-850 shadow-neo-lg border-2 border-slate-border max-h-60 overflow-y-auto"
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
                    ? "bg-glacial/15 text-glacial font-medium" 
                    : "text-slate-text hover:bg-obsidian-700/60 hover:text-glacial-100"
                )}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-slate-tertiary mt-0.5">{option.description}</span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-glacial shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-status-critical font-mono mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
