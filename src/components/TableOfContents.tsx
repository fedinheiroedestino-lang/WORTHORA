import React, { useState, useEffect } from 'react';
import { ListFilter, ChevronDown, Check } from 'lucide-react';

interface TocItem {
  id: string;
  label: string;
  icon?: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav className="my-8 bg-stone-100/80 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 transition">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <ListFilter className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Table of Contents &amp; Test Index
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              Jump directly to bench test sections and verdict
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 p-1 rounded transition"
          aria-label="Toggle table of contents"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <ul className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-1.5 text-xs sm:text-sm">
          {items.map((item, idx) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer font-medium ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold border-l-2 border-amber-500'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-stone-400">{idx + 1}.</span>
                    <span>{item.label}</span>
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};
