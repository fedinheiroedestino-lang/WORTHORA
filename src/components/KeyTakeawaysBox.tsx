import React from 'react';
import { Sparkles, Trophy, Check, ArrowRight } from 'lucide-react';
import { Post } from '../types';

interface KeyTakeawaysBoxProps {
  post: Post;
  onJumpToWinner: () => void;
}

export const KeyTakeawaysBox: React.FC<KeyTakeawaysBoxProps> = ({ post, onJumpToWinner }) => {
  const winner = post.products.find(p => p.isWinner) || post.products[0];
  const runnerUp = post.products.find(p => !p.isWinner);

  return (
    <div className="my-6 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-500 text-stone-950 rounded-lg">
            <Sparkles className="w-4 h-4 fill-current" />
          </span>
          <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
            30-Second Lab Takeaways (TL;DR)
          </h3>
        </div>

        {winner && (
          <button
            onClick={onJumpToWinner}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View Winner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 text-xs">
        {/* Overall Champion */}
        <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold uppercase tracking-wider text-[10px]">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span>Top Tested Champion</span>
          </div>
          <p className="font-extrabold text-stone-900 line-clamp-1">{winner?.name || post.quickVerdict.winnerProductName}</p>
          <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
            Rated {post.quickVerdict.overallScore}/10 with decisive marks across thermal efficiency and sustained output.
          </p>
        </div>

        {/* Runner-Up / Best Value */}
        <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider text-[10px]">
            <Check className="w-3 h-3 text-blue-600" />
            <span>Notable Alternative</span>
          </div>
          <p className="font-extrabold text-stone-900 line-clamp-1">{runnerUp?.name || 'Competing Contender'}</p>
          <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
            A solid budget-conscious choice for shoppers with moderate daily demands.
          </p>
        </div>

        {/* Lab Verdict */}
        <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Editorial Verdict</span>
          </div>
          <p className="font-extrabold text-stone-900 line-clamp-1">{post.quickVerdict.verdictBadge || 'Lab Approved'}</p>
          <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
            {post.quickVerdict.summary}
          </p>
        </div>
      </div>
    </div>
  );
};
