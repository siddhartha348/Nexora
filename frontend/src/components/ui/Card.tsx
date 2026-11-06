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
  cyberHeaderLine = true,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-obsidian-750/70 border-slate-border text-slate-text",
    elevated: "bg-obsidian-750/90 border-slate-border shadow-cyber-panel text-slate-text",
    interactive: "bg-obsidian-750/70 border-slate-border hover:border-cyber-cyan/40 hover:bg-obsidian-700/80 hover:shadow-cyber-cyan cursor-pointer transition-all duration-200",
    critical: "bg-status-critical-bg border-status-critical-border text-slate-text",
    warning: "bg-status-warning-bg border-status-warning-border text-slate-text",
    success: "bg-status-success-bg border-status-success-border text-slate-text",
    cyber: "bg-cyber-panel/90 border-cyber-border text-slate-text shadow-cyber-panel",
  };

  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-md p-5 relative overflow-hidden transition-all duration-200 group",
        variantStyles[variant],
        glow && "shadow-cyber-cyan border-cyber-cyan/40",
        className
      )}
      {...props}
    >
      {/* Cybercore Top Hairline Laser Accent */}
      {cyberHeaderLine && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent pointer-events-none group-hover:via-cyber-cyan/70 transition-all duration-300" />
      )}
      {/* Corner crosshair ticks for cyber aesthetic */}
      <span className="absolute top-1.5 left-2 text-[8px] font-mono text-cyber-cyan/20 pointer-events-none select-none">+</span>
      <span className="absolute top-1.5 right-2 text-[8px] font-mono text-cyber-cyan/20 pointer-events-none select-none">+</span>
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
  <div className={cn("flex items-start justify-between gap-4 mb-4", className)} {...props}>
    <div>
      {telemetry && (
        <span className="text-[9px] font-mono tracking-widest text-cyber-cyan/80 uppercase block mb-1">
          // {telemetry}
        </span>
      )}
      {title && <h3 className="text-base font-semibold text-slate-text tracking-tight flex items-center gap-2">{title}</h3>}
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

