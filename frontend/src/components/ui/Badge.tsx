import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'warning' | 'success' | 'outline' | 'mono' | 'cyber' | 'cyber-neon' | 'cyber-terminal';
  size?: 'sm' | 'md';
  dot?: boolean;
  bracket?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  dot = false,
  bracket = false,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-glacial text-obsidian-950 border-2 border-black font-bold shadow-neo-sm",
    secondary: "bg-obsidian-800 text-slate-text border-2 border-slate-border font-semibold shadow-neo-sm",
    critical: "bg-status-critical text-obsidian-950 border-2 border-black font-bold shadow-neo-sm",
    warning: "bg-status-warning text-obsidian-950 border-2 border-black font-bold shadow-neo-sm",
    success: "bg-status-success text-obsidian-950 border-2 border-black font-bold shadow-neo-sm",
    outline: "bg-obsidian text-slate-text border-2 border-slate-border font-mono",
    mono: "bg-obsidian-850 text-glacial border-2 border-slate-border font-mono font-bold shadow-neo-sm",
    cyber: "bg-obsidian-900 text-glacial border-2 border-glacial font-mono uppercase shadow-neo-accent-sm font-bold",
    'cyber-neon': "bg-glacial text-obsidian-950 border-2 border-black font-mono font-bold uppercase shadow-neo-sm",
    'cyber-terminal': "bg-obsidian-950 text-status-success border-2 border-status-success font-mono uppercase font-bold",
  };

  const dotColorMap = {
    primary: "bg-obsidian-950",
    secondary: "bg-glacial",
    critical: "bg-obsidian-950",
    warning: "bg-obsidian-950",
    success: "bg-obsidian-950",
    outline: "bg-slate-text",
    mono: "bg-glacial",
    cyber: "bg-glacial",
    'cyber-neon': "bg-obsidian-950",
    'cyber-terminal': "bg-status-success",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5 rounded",
    md: "text-xs px-2.5 py-1 gap-2 rounded",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center select-none tracking-tight",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {bracket && <span className="font-mono text-xs opacity-75 mr-0.5">[</span>}
      {dot && (
        <span 
          className={cn("w-2 h-2 rounded-full shrink-0 border border-black/40", dotColorMap[variant])} 
          aria-hidden="true" 
        />
      )}
      {children}
      {bracket && <span className="font-mono text-xs opacity-75 ml-0.5">]</span>}
    </span>
  );
};
