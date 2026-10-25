import React, { useState, useEffect } from 'react';
import { Trophy, BarChart3, Microscope, MessageSquare, ArrowUp, ShoppingCart } from 'lucide-react';
import { ProductItem } from '../types';

interface QuickJumpBarProps {
  winnerProduct?: ProductItem;
}

export const QuickJumpBar: React.FC<QuickJumpBarProps> = ({ winnerProduct }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsVisible(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Article quick navigation" className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] sm:w-auto animate-fadeIn">
      <div className="bg-stone-900/95 backdrop-blur-md text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl border border-stone-700/80 flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold">
        {/* Winner */}
        <button
          onClick={() => scrollTo('quick-verdict')}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-amber-300 rounded-full transition cursor-pointer"
          title="Jump directly to Editor's Choice and Verdict"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xs:inline">Winner</span>
        </button>

        {/* Spec Matrix */}
        <button
          onClick={() => scrollTo('spec-matrix')}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 hover:bg-stone-800 text-stone-200 rounded-full transition cursor-pointer"
          title="View Head-to-Head Specification Matrix"
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Specs</span>
        </button>

        {/* Lab Notes */}
        <button
          onClick={() => scrollTo('lab-notes')}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 hover:bg-stone-800 text-stone-200 rounded-full transition cursor-pointer"
          title="View E-E-A-T Lab Bench Notes"
        >
          <Microscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden md:inline">Lab Notes</span>
        </button>

        {/* Poll */}
        <button
          onClick={() => scrollTo('community-poll')}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 hover:bg-stone-800 text-stone-200 rounded-full transition cursor-pointer"
          title="View Community Reader Poll"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden md:inline">Poll</span>
        </button>

        {/* Direct Deal Link */}
        {winnerProduct && (
          <a
            href={winnerProduct.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-full transition shadow-xs shrink-0 cursor-pointer"
            title={`Check Best Price for ${winnerProduct.name} on ${winnerProduct.buyRetailer || 'Amazon'}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span>Best Price</span>
          </a>
        )}

        {/* Back to top with Circular Progress indicator */}
        <button
          onClick={scrollToTop}
          className="relative w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer shrink-0 ml-1"
          title="Back to Top"
        >
          <svg className="absolute inset-0 w-8 h-8 -rotate-90 pointer-events-none" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="#44403c"
              strokeWidth="2.5"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="81.68"
              strokeDashoffset={81.68 - (81.68 * scrollProgress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <ArrowUp className="w-3.5 h-3.5 relative z-10" />
        </button>
      </div>
    </aside>
  );
};
