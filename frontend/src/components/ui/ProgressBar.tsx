import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'yellow' | 'red' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  }[size];

  const variantColors = {
    primary: 'bg-primary',
    yellow: 'bg-accent-yellow',
    red: 'bg-severity-red',
    green: 'bg-severity-green',
  }[variant];

  return (
    <div className={cn("w-full space-y-1.5 font-sans", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-bold text-ink">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono">{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full bg-surface border-3 border-ink rounded-[4px] shadow-neo-sm overflow-hidden p-0.5",
          sizeClasses
        )}
      >
        <div
          className={cn(
            "h-full rounded-[2px] transition-all duration-200 border-r-2 border-ink",
            variantColors
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

