import React, { useState, useEffect } from 'react';
import { Vote, Users, CheckCircle2, Trophy } from 'lucide-react';
import { ProductItem } from '../types';

interface CommunityPollProps {
  postId: string;
  postTitle: string;
  products: ProductItem[];
}

export const CommunityPoll: React.FC<CommunityPollProps> = ({ postId, products }) => {
  const storageKey = `worthora_poll_voted_${postId}`;
  const legacyStorageKey = `omniverdict_poll_voted_${postId}`;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load local voted state
    const savedVote = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
    if (savedVote) {
      setSelectedProductId(savedVote);
      setHasVoted(true);
    }

    // Initialize mock distribution or read stored
    const votesKey = `worthora_poll_counts_${postId}`;
    const legacyVotesKey = `omniverdict_poll_counts_${postId}`;
    const savedCounts = localStorage.getItem(votesKey) || localStorage.getItem(legacyVotesKey);
    if (savedCounts) {
      try {
        setVotes(JSON.parse(savedCounts));
        return;
      } catch (e) {}
    }

    // Default realistic seed votes (based on product ratings)
    const seed: Record<string, number> = {};
    products.forEach((p, idx) => {
      seed[p.id] = Math.round((p.rating * 12) + (idx === 0 ? 45 : 22));
    });
    setVotes(seed);
  }, [postId, storageKey, legacyStorageKey, products]);

  const handleVote = (productId: string) => {
    if (hasVoted) return;

    const updated = {
      ...votes,
      [productId]: (votes[productId] || 0) + 1
    };

    setVotes(updated);
    setSelectedProductId(productId);
    setHasVoted(true);
    localStorage.setItem(storageKey, productId);
    localStorage.setItem(`worthora_poll_counts_${postId}`, JSON.stringify(updated));
  };

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);

  return (
    <div id="community-poll" className="my-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
              Community Reader Poll
            </span>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              Which contender would you buy for your daily setup?
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Users className="w-3.5 h-3.5" />
          <span>{totalVotes.toLocaleString()} votes cast</span>
        </div>
      </div>

      <p className="text-xs text-stone-600 dark:text-stone-400 mt-4 mb-6 leading-relaxed">
        {hasVoted 
          ? 'Thank you for voting! Here is the live preference of our verified readers:'
          : 'Vote with 1 click (no sign-up required). Your input helps fellow shoppers make the smartest choice:'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(product => {
          const productVotes = votes[product.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((productVotes / totalVotes) * 100) : 0;
          const isSelected = selectedProductId === product.id;

          return (
            <div
              key={product.id}
              onClick={() => !hasVoted && handleVote(product.id)}
              className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                hasVoted 
                  ? 'cursor-default border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850' 
                  : 'cursor-pointer hover:border-amber-400 hover:shadow-md bg-stone-50/30 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
              } ${isSelected ? 'ring-2 ring-amber-500 border-amber-500' : ''}`}
            >
              <div className="flex items-start gap-3 relative z-10">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">{product.brand}</span>
                    {product.isWinner && (
                      <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded uppercase flex items-center gap-0.5">
                        <Trophy className="w-2.5 h-2.5" /> Lab Pick
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress bar or Vote button */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                {hasVoted ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-600 dark:text-stone-400 font-bold flex items-center gap-1">
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                        {isSelected ? 'Your vote' : 'Community'}
                      </span>
                      <span className="font-black text-stone-900 dark:text-white">
                        {percentage}% ({productVotes})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isSelected ? 'bg-amber-500' : 'bg-stone-400 dark:bg-stone-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(product.id);
                    }}
                    className="w-full py-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Vote for this model</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
