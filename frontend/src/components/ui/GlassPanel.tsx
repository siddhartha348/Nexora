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
    subtle: "bg-obsidian-850/40 backdrop-blur-sm border-white/5",
    medium: "bg-obsidian-800/80 backdrop-blur-md border-slate-border",
    deep: "bg-obsidian-850/95 backdrop-blur-xl border-cyber-border shadow-cyber-panel",
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200 relative overflow-hidden",
        intensityMap[intensity],
        glowBorder && "shadow-cyber-cyan border-cyber-cyan/40",
        className
      )}
      {...props}
    >
      {cyberBeam && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/60 to-transparent pointer-events-none" />
      )}
      {children}
    </div>
  );
};

