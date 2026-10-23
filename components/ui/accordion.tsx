import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import { ChevronDown } from 'lucide-react';

interface AccordionItemData {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}) => {
  const [openIds, setOpenIds] = React.useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-xs text-[#0F3D5C] font-bold block">{item.title}</span>
                {item.subtitle && (
                  <span className="text-[11px] text-[#64748B] block font-normal mt-0.5">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform duration-200',
                  isOpen && 'rotate-180 text-[#0F3D5C]'
                )}
              />
            </button>
            {isOpen && (
              <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-50 animate-in fade-in">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
