import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    disabled, 
    children, 
    leftIcon, 
    rightIcon, 
    type = 'button',
    ...props 
  }, ref) => {

    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2 aspect-square",
    };

    const variantStyles = {
      primary: "bg-glacial text-obsidian font-semibold hover:bg-glacial-300 shadow-glass-glow hover:shadow-lg focus-visible:ring-glacial",
      secondary: "bg-obsidian-700/80 text-slate-text border border-slate-border hover:bg-obsidian-600 hover:border-glacial/30 focus-visible:ring-glacial",
      outline: "bg-transparent text-slate-text border border-slate-border hover:bg-obsidian-700/50 hover:border-glacial/40 focus-visible:ring-glacial",
      ghost: "bg-transparent text-slate-muted hover:text-slate-text hover:bg-obsidian-700/40 focus-visible:ring-glacial",
      danger: "bg-status-critical/15 text-status-critical border border-status-critical/30 hover:bg-status-critical/25 shadow-status-critical focus-visible:ring-status-critical",
      success: "bg-status-success/15 text-status-success border border-status-success/30 hover:bg-status-success/25 shadow-status-success focus-visible:ring-status-success",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        
        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

