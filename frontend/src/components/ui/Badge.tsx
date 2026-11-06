import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'warning' | 'success' | 'outline' | 'mono' | 'cyber' | 'cyber-neon' | 'cyber-terminal' | 'yellow' | 'pink';
  size?: 'sm' | 'md' | 'lg';
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
    primary: "bg-primary text-white border-2 border-ink font-bold shadow-neo-sm",
    secondary: "bg-surface text-ink border-2 border-ink font-semibold shadow-neo-sm",
    critical: "bg-severity-red text-white border-2 border-ink font-bold shadow-neo-sm",
    warning: "bg-accent-yellow text-ink border-2 border-ink font-bold shadow-neo-sm",
    success: "bg-severity-green text-white border-2 border-ink font-bold shadow-neo-sm",
    yellow: "bg-accent-yellow text-ink border-2 border-ink font-bold shadow-neo-sm",
    pink: "bg-accent-pink text-ink border-2 border-ink font-bold shadow-neo-sm",
    outline: "bg-transparent text-ink border-2 border-ink font-mono",
    mono: "bg-surface text-ink border-2 border-ink font-mono font-bold shadow-neo-sm",
    cyber: "bg-surface text-primary border-2 border-primary font-mono uppercase shadow-neo-sm font-bold",
    'cyber-neon': "bg-accent-yellow text-ink border-2 border-ink font-mono font-bold uppercase shadow-neo-sm",
    'cyber-terminal': "bg-surface text-severity-green border-2 border-severity-green font-mono uppercase font-bold",
  };

  const dotColorMap = {
    primary: "bg-white",
    secondary: "bg-primary",
    critical: "bg-white",
    warning: "bg-ink",
    success: "bg-white",
    yellow: "bg-ink",
    pink: "bg-ink",
    outline: "bg-ink",
    mono: "bg-primary",
    cyber: "bg-primary",
    'cyber-neon': "bg-ink",
    'cyber-terminal': "bg-severity-green",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5 rounded-[4px]",
    md: "text-xs px-2.5 py-1 gap-2 rounded-[4px]",
    lg: "text-sm px-3 py-1.5 gap-2.5 rounded-[6px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center select-none tracking-tight font-sans",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {bracket && <span className="font-mono text-xs opacity-75 mr-0.5">[</span>}
      {dot && (
        <span
          className={cn("w-2 h-2 rounded-full shrink-0 border border-ink/40", dotColorMap[variant])}
          aria-hidden="true"
        />
      )}
      {children}
      {bracket && <span className="font-mono text-xs opacity-75 ml-0.5">]</span>}
    </span>
  );
};

export type SeverityType = 'RED' | 'YELLOW' | 'GREEN';

export interface SeverityBadgeProps {
  severity: SeverityType | string;
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Strict accessibility rule: Never use colour alone to indicate severity.
 * Always renders an explicit icon + descriptive text label.
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  customLabel,
  size = 'md',
  className,
}) => {
  const normalized = (severity || '').toUpperCase();

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  if (normalized === 'RED') {
    return (
      <Badge
        variant="critical"
        size={size}
        className={cn("gap-1.5 tracking-wide", className)}
        role="status"
        aria-label="Severity RED: Action Required"
      >
        <AlertCircle className={cn(iconSizes, "stroke-[3] shrink-0 text-white")} aria-hidden="true" />
        <span>{customLabel || 'RED // ACTION REQUIRED'}</span>
      </Badge>
    );
  }

  if (normalized === 'YELLOW') {
    return (
      <Badge
        variant="warning"
        size={size}
        className={cn("gap-1.5 tracking-wide text-ink", className)}
        role="status"
        aria-label="Severity YELLOW: Caution"
      >
        <AlertTriangle className={cn(iconSizes, "stroke-[3] shrink-0 text-ink")} aria-hidden="true" />
        <span>{customLabel || 'YELLOW // CAUTION'}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="success"
      size={size}
      className={cn("gap-1.5 tracking-wide", className)}
      role="status"
      aria-label="Severity GREEN: No Critical Issues Detected"
    >
      <CheckCircle2 className={cn(iconSizes, "stroke-[3] shrink-0 text-white")} aria-hidden="true" />
      <span>{customLabel || 'GREEN // NO CRITICAL ISSUES DETECTED'}</span>
    </Badge>
  );
};
