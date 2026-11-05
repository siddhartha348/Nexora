import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'critical' | 'warning' | 'success';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  glow = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-obsidian-700/60 border-slate-border text-slate-text",
    elevated: "bg-obsidian-700/90 border-slate-border shadow-ambient text-slate-text",
    interactive: "bg-obsidian-700/60 border-slate-border hover:border-glacial/30 hover:bg-obsidian-600/70 hover:shadow-glass-glow cursor-pointer transition-all duration-200",
    critical: "bg-status-critical-bg border-status-critical-border text-slate-text",
    warning: "bg-status-warning-bg border-status-warning-border text-slate-text",
    success: "bg-status-success-bg border-status-success-border text-slate-text",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-md p-5 relative overflow-hidden transition-all duration-200",
        variantStyles[variant],
        glow && "shadow-glass-glow",
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
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  description,
  action,
  children,
  ...props
}) => (
  <div className={cn("flex items-start justify-between gap-4 mb-4", className)} {...props}>
    <div>
      {title && <h3 className="text-base font-semibold text-slate-text tracking-tight">{title}</h3>}
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
      "mt-5 pt-4 border-t border-slate-border/50 flex items-center justify-between text-xs text-slate-muted",
      className
    )}
    {...props}
  />
);
