import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div className={cn("w-full font-sans select-none", className)}>
      <div className="flex items-center justify-between relative">
        {/* Horizontal connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-ink -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = Boolean(onStepClick && (isCompleted || isCurrent));

          return (
            <div
              key={step.id}
              className={cn(
                "relative z-10 flex flex-col items-center",
                isClickable && "cursor-pointer group"
              )}
              onClick={() => isClickable && onStepClick?.(idx)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-[6px] border-3 border-ink flex items-center justify-center font-bold text-sm transition-all duration-150 shadow-neo-sm",
                  isCompleted && "bg-severity-green text-white",
                  isCurrent && "bg-accent-yellow text-ink shadow-neo scale-110",
                  !isCompleted && !isCurrent && "bg-surface text-ink",
                  isClickable && "group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-hover:shadow-neo"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="mt-2 text-center">
                <span
                  className={cn(
                    "block text-xs uppercase tracking-wider font-bold whitespace-nowrap px-1.5 py-0.5 rounded border border-transparent",
                    isCurrent && "bg-paper text-ink border-ink shadow-neo-sm",
                    isCompleted && "text-ink",
                    !isCompleted && !isCurrent && "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[10px] text-text-muted font-mono mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

