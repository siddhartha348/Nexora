import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export type StatusLevel = 'RED' | 'YELLOW' | 'GREEN' | 'UNVERIFIABLE' | 'NEUTRAL';

export interface StatusIndicatorProps {
  level: StatusLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  level,
  label,
  size = 'md',
  showIcon = true,
  pulse = true,
  className,
}) => {
  const config = {
    RED: {
      color: 'text-status-critical',
      bg: 'bg-status-critical/10',
      border: 'border-status-critical/30',
      dot: 'bg-status-critical',
      glow: 'shadow-status-critical',
      defaultLabel: 'Critical Contradiction',
      icon: AlertCircle,
    },
    YELLOW: {
      color: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      dot: 'bg-status-warning',
      glow: 'shadow-status-warning',
      defaultLabel: 'Warning / Inconsistency',
      icon: AlertTriangle,
    },
    GREEN: {
      color: 'text-status-success',
      bg: 'bg-status-success/10',
      border: 'border-status-success/30',
      dot: 'bg-status-success',
      glow: 'shadow-status-success',
      defaultLabel: 'Compliant Check',
      icon: CheckCircle2,
    },
    UNVERIFIABLE: {
      color: 'text-slate-muted',
      bg: 'bg-obsidian-700/60',
      border: 'border-slate-border',
      dot: 'bg-slate-muted',
      glow: '',
      defaultLabel: 'Unverifiable Claim',
      icon: HelpCircle,
    },
    NEUTRAL: {
      color: 'text-slate-muted',
      bg: 'bg-obsidian-700/40',
      border: 'border-slate-border',
      dot: 'bg-slate-muted',
      glow: '',
      defaultLabel: 'Pending',
      icon: HelpCircle,
    },
  }[level];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-semibold',
  }[size];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border backdrop-blur-sm select-none",
        config.bg,
        config.border,
        config.color,
        sizeClasses,
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <span className={cn("w-2 h-2 rounded-full", config.dot)} />
        {pulse && (level === 'RED' || level === 'YELLOW') && (
          <span className={cn("absolute w-2 h-2 rounded-full animate-ping opacity-75", config.dot)} />
        )}
      </div>

      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}

      <span>{label || config.defaultLabel}</span>
    </div>
  );
};
