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
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border-3 border-dashed border-ink bg-surface rounded-[6px] shadow-neo font-sans",
        className
      )}
    >
      <div className="w-14 h-14 bg-paper border-3 border-ink rounded-[6px] flex items-center justify-center text-ink mb-4 shadow-neo-sm">
        {icon || <FolderSearch className="w-7 h-7 stroke-[2]" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
