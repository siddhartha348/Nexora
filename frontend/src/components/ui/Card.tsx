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
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-surface border-3 border-ink text-ink shadow-neo",
    elevated: "bg-surface border-3 border-ink shadow-neo-lg text-ink",
    interactive: "bg-surface border-3 border-ink hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neo-lg cursor-pointer transition-all duration-150 text-ink",
    critical: "bg-surface border-3 border-severity-red text-ink shadow-neo-critical",
    warning: "bg-surface border-3 border-severity-yellow text-ink shadow-neo-warning",
    success: "bg-surface border-3 border-severity-green text-ink shadow-neo-success",
    cyber: "bg-surface border-3 border-primary text-ink shadow-neo-primary",
  };

  return (
    <div
      className={cn(
        "rounded-[6px] p-5 relative transition-all duration-150 font-sans",
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
  <div className={cn("flex items-start justify-between gap-4 mb-4 pb-3 border-b-2 border-ink/20", className)} {...props}>
    <div>
      {telemetry && (
        <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase block mb-1">
          // {telemetry}
        </span>
      )}
      {title && <h3 className="text-base font-bold text-ink tracking-tight flex items-center gap-2">{title}</h3>}
      {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
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
      "mt-5 pt-3 border-t-2 border-ink/20 flex items-center justify-between text-xs text-text-muted font-mono",
      className
    )}
    {...props}
  />
);
