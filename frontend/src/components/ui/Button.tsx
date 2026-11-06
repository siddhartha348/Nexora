import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'cyber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  cyberBracket?: boolean;
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
    cyberBracket = false,
    type = 'button',
    ...props 
  }, ref) => {

    const baseStyles = "relative inline-flex items-center justify-center font-bold border-3 border-ink transition-all duration-120 select-none font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:not(:disabled):-translate-x-[2px] hover:not(:disabled):-translate-y-[2px] hover:not(:disabled):shadow-neo-sm active:not(:disabled):translate-x-[2px] active:not(:disabled):translate-y-[2px] active:not(:disabled):shadow-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-[4px] shadow-neo-sm",
      md: "text-sm px-4 py-2 gap-2 rounded-[6px] shadow-neo",
      lg: "text-base px-6 py-2.5 gap-2.5 rounded-[6px] shadow-neo-lg",
      icon: "p-2 aspect-square rounded-[6px] shadow-neo-sm",
    };

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover",
      secondary: "bg-surface text-ink hover:bg-paper",
      outline: "bg-transparent text-ink hover:bg-surface",
      ghost: "bg-transparent text-ink border-transparent shadow-none hover:bg-surface hover:border-ink hover:shadow-neo-sm",
      danger: "bg-severity-red text-white hover:brightness-105",
      success: "bg-severity-green text-white hover:brightness-105",
      cyber: "bg-surface text-primary border-primary hover:bg-primary hover:text-white font-mono text-xs uppercase",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {cyberBracket && <span className="font-mono text-xs mr-1 opacity-70">[</span>}

        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current bg-current animate-pulse mr-1.5 shrink-0" aria-label="Loading..." />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        
        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}

        {cyberBracket && <span className="font-mono text-xs ml-1 opacity-70">]</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
