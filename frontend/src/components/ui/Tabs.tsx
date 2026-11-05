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
        "flex items-center gap-1.5 p-1 select-none",
        variant === 'pills' && "bg-obsidian-800/80 rounded-xl border border-slate-border",
        variant === 'glass' && "glass-panel rounded-xl p-1.5",
        variant === 'underline' && "border-b border-slate-border w-full gap-6 px-0",
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
                "pb-3 pt-1 text-sm font-medium transition-all relative flex items-center gap-2",
                isActive
                  ? "text-glacial border-b-2 border-glacial font-semibold"
                  : "text-slate-muted hover:text-slate-text"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-mono",
                    isActive ? "bg-glacial/20 text-glacial" : "bg-obsidian-700 text-slate-muted"
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
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-glacial/20 text-glacial shadow-sm border border-glacial/30 font-semibold"
                : "text-slate-muted hover:text-slate-text hover:bg-obsidian-700/50"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                  isActive ? "bg-glacial/30 text-glacial" : "bg-obsidian-700 text-slate-muted"
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
