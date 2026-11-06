import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: "h-4 rounded-[4px] w-3/4",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-[6px]",
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-surface border-2 border-ink neo-skeleton",
        variantStyles,
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-5 rounded-[6px] neo-card space-y-4", className)}>
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" className="w-full h-24" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton variant="text" className="w-20 h-4" />
      <Skeleton variant="rectangular" className="w-16 h-8 rounded-[4px]" />
    </div>
  </div>
);
