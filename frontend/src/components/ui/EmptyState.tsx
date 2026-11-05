import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { FolderSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-border/80 bg-obsidian-800/20 backdrop-blur-xs",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-obsidian-700/80 border border-slate-border flex items-center justify-center text-glacial mb-4 shadow-glass-glow">
        {icon || <FolderSearch className="w-7 h-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-slate-text tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

