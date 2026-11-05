import React from 'react';
import { cn } from '../../utils/cn';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'medium' | 'deep';
  glowBorder?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  className,
  intensity = 'medium',
  glowBorder = false,
  children,
  ...props
}) => {
  const intensityMap = {
    subtle: "bg-obsidian-800/40 backdrop-blur-sm border-white/5",
    medium: "bg-obsidian-800/75 backdrop-blur-md border-slate-border",
    deep: "bg-obsidian-800/90 backdrop-blur-xl border-slate-border shadow-ambient",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        intensityMap[intensity],
        glowBorder && "shadow-glass-glow border-glacial/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
