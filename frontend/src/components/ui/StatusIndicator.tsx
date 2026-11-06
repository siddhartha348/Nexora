import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export type StatusLevel = 'RED' | 'YELLOW' | 'GREEN' | 'UNVERIFIABLE' | 'NEUTRAL';

export interface StatusIndicatorProps {
  level: StatusLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Strict accessibility rule: Never use colour alone to indicate severity.
 * Always renders an explicit icon + descriptive text label.
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  level,
  label,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = {
    RED: {
      color: 'text-white',
      bg: 'bg-severity-red',
      border: 'border-ink',
      defaultLabel: 'RED // ACTION REQUIRED',
      icon: AlertCircle,
    },
    YELLOW: {
      color: 'text-ink',
      bg: 'bg-accent-yellow',
      border: 'border-ink',
      defaultLabel: 'YELLOW // CAUTION',
      icon: AlertTriangle,
    },
    GREEN: {
      color: 'text-white',
      bg: 'bg-severity-green',
      border: 'border-ink',
      defaultLabel: 'GREEN // NO CRITICAL ISSUES DETECTED',
      icon: CheckCircle2,
    },
    UNVERIFIABLE: {
      color: 'text-ink',
      bg: 'bg-surface',
      border: 'border-ink',
      defaultLabel: 'UNVERIFIABLE CLAIM',
      icon: HelpCircle,
    },
    NEUTRAL: {
      color: 'text-ink',
      bg: 'bg-paper',
      border: 'border-ink',
      defaultLabel: 'PENDING AUDIT',
      icon: HelpCircle,
    },
  }[level];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 rounded-[4px]',
    md: 'text-xs px-2.5 py-1 gap-2 rounded-[4px] font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 rounded-[6px] font-bold',
  }[size];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-label={label || config.defaultLabel}
      className={cn(
        "inline-flex items-center border-2 select-none shadow-neo-sm font-sans tracking-wide",
        config.bg,
        config.border,
        config.color,
        sizeClasses,
        className
      )}
    >
      {showIcon && <Icon className="w-4 h-4 shrink-0 stroke-[2.5]" aria-hidden="true" />}
      <span>{label || config.defaultLabel}</span>
    </div>
  );
};
