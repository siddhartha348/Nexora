import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'warning' | 'success' | 'outline' | 'mono';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-glacial/15 text-glacial border-glacial/30",
    secondary: "bg-obsidian-700/80 text-slate-muted border-slate-border",
    critical: "bg-status-critical/15 text-status-critical border-status-critical/30",
    warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
    success: "bg-status-success/15 text-status-success border-status-success/30",
    outline: "bg-transparent text-slate-text border-slate-border",
    mono: "bg-obsidian-700/90 text-glacial-200 border-slate-border font-mono",
  };

  const dotColorMap = {
    primary: "bg-glacial",
    secondary: "bg-slate-muted",
    critical: "bg-status-critical animate-pulse",
    warning: "bg-status-warning animate-pulse",
    success: "bg-status-success",
    outline: "bg-slate-text",
    mono: "bg-glacial",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span 
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColorMap[variant])} 
          aria-hidden="true" 
        />
      )}
      {children}
    </span>
  );
};
