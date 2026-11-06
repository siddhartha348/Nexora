import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'critical' | 'warning' | 'success' | 'cyber';
  glow?: boolean;
  cyberHeaderLine?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  glow = false,
  cyberHeaderLine = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-obsidian-800 border-2 border-slate-border text-slate-text shadow-neo",
    elevated: "bg-obsidian-750 border-2 border-slate-border shadow-neo-lg text-slate-text",
    interactive: "bg-obsidian-800 border-2 border-slate-border hover:border-glacial hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg cursor-pointer transition-all duration-150 text-slate-text",
    critical: "bg-status-critical-bg border-2 border-status-critical text-slate-text shadow-neo-critical",
    warning: "bg-status-warning-bg border-2 border-status-warning text-slate-text shadow-neo-warning",
    success: "bg-status-success-bg border-2 border-status-success text-slate-text shadow-neo-success",
    cyber: "bg-obsidian-850 border-2 border-glacial text-slate-text shadow-neo-accent",
  };

  return (
    <div
      className={cn(
        "rounded-md p-5 relative transition-all duration-150",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  telemetry?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  description,
  telemetry,
  action,
  children,
  ...props
}) => (
  <div className={cn("flex items-start justify-between gap-4 mb-4 pb-3 border-b-2 border-slate-border/40", className)} {...props}>
    <div>
      {telemetry && (
        <span className="text-[10px] font-mono tracking-widest text-glacial font-bold uppercase block mb-1">
          // {telemetry}
        </span>
      )}
      {title && <h3 className="text-base font-bold text-slate-text tracking-tight flex items-center gap-2">{title}</h3>}
      {description && <p className="text-xs text-slate-muted mt-0.5">{description}</p>}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("space-y-4", className)} {...props} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "mt-5 pt-3 border-t-2 border-slate-border flex items-center justify-between text-xs text-slate-muted font-mono",
      className
    )}
    {...props}
  />
);
