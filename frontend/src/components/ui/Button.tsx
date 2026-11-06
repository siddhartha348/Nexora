import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'cyber' | 'cyber-outline';
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

    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
      md: "text-sm px-4 py-2 gap-2 rounded-lg",
      lg: "text-base px-5 py-2.5 gap-2.5 rounded-xl",
      icon: "p-2 aspect-square rounded-lg",
    };

    const variantStyles = {
      primary: "bg-glacial text-obsidian font-semibold hover:bg-cyber-cyan shadow-glass-glow hover:shadow-cyber-cyan focus-visible:ring-cyber-cyan border border-glacial/40 hover:border-cyber-cyan",
      secondary: "bg-obsidian-750/90 text-slate-text border border-slate-border hover:bg-obsidian-700 hover:border-cyber-cyan/40 hover:text-white shadow-sm focus-visible:ring-cyber-cyan",
      outline: "bg-transparent text-slate-text border border-slate-border hover:bg-obsidian-700/60 hover:border-cyber-cyan/50 hover:text-cyber-cyan focus-visible:ring-cyber-cyan",
      ghost: "bg-transparent text-slate-muted hover:text-cyber-cyan hover:bg-obsidian-700/50 focus-visible:ring-cyber-cyan",
      danger: "bg-status-critical/15 text-status-critical border border-status-critical/30 hover:bg-status-critical/25 shadow-status-critical focus-visible:ring-status-critical",
      success: "bg-status-success/15 text-status-success border border-status-success/30 hover:bg-status-success/25 shadow-status-success focus-visible:ring-status-success",
      cyber: "bg-cyber-panel text-cyber-cyan border border-cyber-cyan/50 hover:border-cyber-cyan hover:bg-cyber-cyan/15 hover:shadow-cyber-cyan font-mono tracking-wide text-xs uppercase clip-cyber-btn",
      'cyber-outline': "bg-transparent text-slate-text border border-cyber-cyan/30 hover:border-cyber-cyan hover:text-cyber-cyan hover:bg-obsidian-800/80 font-mono text-xs uppercase tracking-wider",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {cyberBracket && <span className="text-cyber-cyan/60 font-mono text-xs mr-0.5">[</span>}

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        
        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}

        {cyberBracket && <span className="text-cyber-cyan/60 font-mono text-xs ml-0.5">]</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

