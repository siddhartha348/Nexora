import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline' | 'glass';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-2 p-1.5 select-none font-sans overflow-x-auto",
        variant === 'pills' && "bg-surface rounded-[6px] border-3 border-ink shadow-neo-sm",
        variant === 'glass' && "bg-surface rounded-[6px] border-3 border-ink shadow-neo",
        variant === 'underline' && "border-b-3 border-ink w-full gap-4 px-0",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "pb-2.5 pt-1 text-sm font-bold transition-all relative flex items-center gap-2 border-b-3 -mb-[3px] cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "text-primary border-primary"
                  : "text-text-muted border-transparent hover:text-ink hover:border-ink/40"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-[4px] border-2 border-ink font-mono font-bold",
                    isActive ? "bg-primary text-white" : "bg-paper text-ink"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all duration-120 cursor-pointer border-2",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? "bg-primary text-white border-ink shadow-neo-sm"
                : "bg-transparent text-ink border-transparent hover:bg-paper hover:border-ink/30"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-[3px] font-mono font-bold border",
                  isActive ? "bg-white text-ink border-ink" : "bg-paper text-ink border-ink/40"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
