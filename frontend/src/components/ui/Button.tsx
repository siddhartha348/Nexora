import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

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

    const baseStyles = "relative inline-flex items-center justify-center font-bold border-2 transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded shadow-neo-sm",
      md: "text-sm px-4 py-2 gap-2 rounded shadow-neo",
      lg: "text-base px-6 py-2.5 gap-2.5 rounded shadow-neo-lg",
      icon: "p-2 aspect-square rounded shadow-neo-sm",
    };

    const variantStyles = {
      primary: "bg-glacial text-obsidian-950 border-black hover:bg-glacial-300",
      secondary: "bg-obsidian-800 text-slate-text border-slate-border hover:bg-obsidian-750 hover:border-glacial",
      outline: "bg-obsidian text-slate-text border-slate-border hover:bg-obsidian-800 hover:border-glacial",
      ghost: "bg-transparent text-slate-muted border-transparent hover:text-slate-text hover:bg-obsidian-800 active:shadow-none",
      danger: "bg-status-critical text-obsidian-950 border-black hover:bg-red-400 shadow-neo",
      success: "bg-status-success text-obsidian-950 border-black hover:bg-emerald-300 shadow-neo",
      cyber: "bg-obsidian-900 text-glacial border-glacial hover:bg-glacial hover:text-obsidian-950 font-mono text-xs uppercase",
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
          <Loader2 className="w-4 h-4 animate-spin text-current" />
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
