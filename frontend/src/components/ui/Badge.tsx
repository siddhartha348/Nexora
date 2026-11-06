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
    primary: "bg-glacial/15 text-glacial border-glacial/30 font-mono tracking-tight",
    secondary: "bg-obsidian-750/90 text-slate-muted border-slate-border",
    critical: "bg-status-critical/15 text-status-critical border-status-critical/30 font-mono",
    warning: "bg-status-warning/15 text-status-warning border-status-warning/30 font-mono",
    success: "bg-status-success/15 text-status-success border-status-success/30 font-mono",
    outline: "bg-transparent text-slate-text border-slate-border",
    mono: "bg-obsidian-800 text-glacial-200 border-slate-border font-mono tracking-wider",
    cyber: "bg-cyber-panel text-cyber-cyan border border-cyber-cyan/40 font-mono uppercase tracking-wider shadow-sm",
    'cyber-neon': "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan shadow-cyber-cyan font-mono font-semibold uppercase tracking-wider",
    'cyber-terminal': "bg-obsidian-950 text-cyber-green border border-cyber-green/40 font-mono uppercase tracking-widest",
  };

  const dotColorMap = {
    primary: "bg-glacial",
    secondary: "bg-slate-muted",
    critical: "bg-status-critical animate-pulse",
    warning: "bg-status-warning animate-pulse",
    success: "bg-status-success",
    outline: "bg-slate-text",
    mono: "bg-glacial",
    cyber: "bg-cyber-cyan animate-pulse",
    'cyber-neon': "bg-cyber-cyan shadow-cyber-cyan animate-ping",
    'cyber-terminal': "bg-cyber-green animate-pulse",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-0.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md border transition-colors select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {bracket && <span className="text-cyber-cyan/50 font-mono">[</span>}
      {dot && (
        <span 
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColorMap[variant])} 
          aria-hidden="true" 
        />
      )}
      {children}
      {bracket && <span className="text-cyber-cyan/50 font-mono">]</span>}
    </span>
  );
};

