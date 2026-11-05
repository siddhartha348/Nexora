import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || '']);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setOpenIds(prev => prev.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen 
                ? 'bg-obsidian-700/80 border-glacial/30 shadow-glass-glow' 
                : 'bg-obsidian-800/60 border-slate-border hover:border-slate-border-subtle'
            }`}
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-5 text-left transition-colors"
            >
              <div className="flex items-center gap-3 pr-4">
                {item.category && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-700 text-glacial border border-glacial/20 shrink-0">
                    {item.category}
                  </span>
                )}
                <span className="text-sm sm:text-base font-semibold text-slate-text">
                  {item.question}
                </span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-slate-tertiary transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-glacial' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-muted leading-relaxed border-t border-slate-border/40 animate-in fade-in-0 duration-150">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

