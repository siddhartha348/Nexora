import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || '']);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("space-y-3 font-sans", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-[6px] border-3 border-ink transition-all duration-150 overflow-hidden shadow-neo-sm",
              isOpen ? "bg-surface shadow-neo" : "bg-surface hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo"
            )}
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-3 pr-4">
                {item.category && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-paper text-ink border-2 border-ink font-bold shrink-0">
                    {item.category}
                  </span>
                )}
                <span className="text-sm sm:text-base font-bold text-ink">
                  {item.question}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-ink transition-transform duration-150 shrink-0 stroke-[3]",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-5 pt-1 text-xs sm:text-sm text-text-muted leading-relaxed border-t-2 border-ink/20">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

