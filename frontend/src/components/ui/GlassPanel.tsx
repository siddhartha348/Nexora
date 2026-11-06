import React from 'react';
import { cn } from '../../utils/cn';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'medium' | 'deep';
  glowBorder?: boolean;
  cyberBeam?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  className,
  intensity = 'medium',
  glowBorder = false,
  cyberBeam = false,
  children,
  ...props
}) => {
  const intensityMap = {
    subtle: "bg-obsidian-850 border-2 border-slate-border shadow-neo-sm",
    medium: "bg-obsidian-850 border-2 border-slate-border shadow-neo",
    deep: "bg-obsidian-900 border-2 border-glacial shadow-neo-accent",
  };

  return (
    <div
      className={cn(
        "rounded-md transition-all duration-150 relative",
        intensityMap[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
