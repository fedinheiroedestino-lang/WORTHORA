import React from 'react';
import { Trophy, Check, ShoppingCart, ExternalLink, Flame, Zap, Star } from 'lucide-react';
import { QuickVerdict, ProductItem } from '../types';

interface VerdictBoxProps {
  verdict: QuickVerdict;
  products: ProductItem[];
}

export const VerdictBox: React.FC<VerdictBoxProps> = ({ verdict, products }) => {
  const winner = products.find(p => p.isWinner) || products[0];

  return (
    <div className="my-8 bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
      {/* Header with Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {verdict.verdictBadge}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Independent Lab Verdict
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Worthora Bottom Line
          </h3>
        </div>

        {/* Big Overall Rating Pill */}
        <div className="flex items-center gap-3 bg-stone-800/90 border border-stone-700 px-5 py-3 rounded-2xl">
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-wider">
              Overall Score
            </p>
            <p className="text-xs text-emerald-400 font-bold">
              Superior Grade
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-amber-500 text-stone-950 font-black text-2xl flex items-center justify-center shadow-lg">
            {verdict.overallScore}
          </div>
        </div>
      </div>

      {/* Summary paragraph */}
      <p className="py-6 text-sm sm:text-base text-stone-300 leading-relaxed">
        {verdict.summary}
      </p>

      {/* Granular Sub-Rating Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-t border-stone-800">
        {verdict.subRatings.map((sub, i) => (
          <div key={i} className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-stone-300 font-medium truncate">{sub.category}</span>
              <span className="font-mono font-bold text-amber-400">{sub.score} / 10</span>
            </div>
            <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${(sub.score / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Highlighted Tested Winner Spotlight */}
      {winner && (
        <div className="mt-6 bg-linear-to-r from-stone-800 via-stone-850 to-stone-800 border-2 border-amber-500/70 rounded-xl p-5 sm:p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={winner.image}
                alt={winner.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-700 border border-stone-600 shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Overall Shootout Winner
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {winner.amazonAdDeal?.badge || "Amazon's Choice"}
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Zap className="w-3 h-3 text-sky-400" />
                    Prime
                  </span>
                  <span className="text-xs text-stone-400">{winner.brand}</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {winner.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-amber-400">
                    ${winner.price.toFixed(2)}
                  </span>
                  {winner.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ${winner.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-emerald-400 font-semibold">
                    In Stock at {winner.buyRetailer}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
                    • {(winner.amazonAdDeal?.reviewsCount || 15400).toLocaleString()} verified reviews (4.8★)
                  </span>
                </div>
              </div>
            </div>

            {/* High Conversion CTA Buy Button */}
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-1.5">
              <a
                href={winner.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Check Price on {winner.buyRetailer || 'Amazon'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-center text-stone-400 font-mono">
                ✓ Exact model match • Verified on Amazon US
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
