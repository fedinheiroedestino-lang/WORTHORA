import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, RotateCcw, Check, Trophy, ExternalLink, Zap } from 'lucide-react';
import { Post } from '../types';

interface BuyerQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const BuyerQuizModal: React.FC<BuyerQuizModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [budget, setBudget] = useState<'budget' | 'mid' | 'pro'>('mid');
  const [intensity, setIntensity] = useState<'diy' | 'enthusiast' | 'commercial'>('enthusiast');
  const [priority, setPriority] = useState<'power' | 'comfort' | 'battery'>('power');

  // Recommendation logic
  const getRecommendation = (): Post => {
    // 1. Try by tags or score
    if (budget === 'pro' || intensity === 'commercial') {
      const topPro = posts.find(p => (p.quickVerdict?.overallScore ?? 0) >= 9.4);
      if (topPro) return topPro;
    }
    if (budget === 'budget') {
      const budgetPick = posts.find(p => p.products?.some(prod => prod.price < 150));
      if (budgetPick) return budgetPick;
    }
    // Default to highest rated
    return [...posts].sort((a, b) => (b.quickVerdict?.overallScore ?? 0) - (a.quickVerdict?.overallScore ?? 0))[0] || posts[0];
  };

  const recommendedPost = getRecommendation();

  const handleFinish = () => {
    onSelectPost(recommendedPost);
    onClose();
  };

  const handleReset = () => {
    setStep(1);
    setBudget('mid');
    setIntensity('enthusiast');
    setPriority('power');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:px-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Interactive Buyer Assistant
              </h3>
              <p className="text-[11px] text-stone-400">
                Answer 3 quick questions to discover the ideal tested recommendation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Steps */}
        <div className="p-6">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  s === step 
                    ? 'bg-amber-500' 
                    : s < step 
                      ? 'bg-stone-900 dark:bg-stone-700' 
                      : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Budget */}
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                Step 1 of 3: Target Budget Range
              </span>
              <h4 className="text-lg font-black text-stone-900 dark:text-white">
                What is your target budget for this purchase?
              </h4>
              <div className="space-y-2.5 pt-2">
                {[
                  { id: 'budget', label: 'Budget-Conscious (Under $120)', desc: 'Maximum performance-per-dollar for light to moderate tasks.' },
                  { id: 'mid', label: 'Mid-Tier Sweet Spot ($120 to $250)', desc: 'The best balance between commercial durability and everyday comfort.' },
                  { id: 'pro', label: 'Flagship / Professional Grade ($250+)', desc: 'Uncompromising power, extended warranties, and reinforced internals.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setBudget(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      budget === opt.id 
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500' 
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{opt.label}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</p>
                    </div>
                    {budget === opt.id && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Usage Frequency */}
          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                Step 2 of 3: Usage Intensity
              </span>
              <h4 className="text-lg font-black text-stone-900 dark:text-white">
                How often will you deploy this equipment?
              </h4>
              <div className="space-y-2.5 pt-2">
                {[
                  { id: 'diy', label: 'Casual Home Routine', desc: 'Weekend tasks, light household maintenance, and basic convenience.' },
                  { id: 'enthusiast', label: 'Enthusiast / Frequent Projects', desc: 'Demanding hobbyist sessions, home garage workshops, and daily workflows.' },
                  { id: 'commercial', label: 'Jobsite / Commercial Daily Use', desc: 'Uninterrupted heavy duty cycles under demanding stress conditions.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setIntensity(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      intensity === opt.id 
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500' 
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{opt.label}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</p>
                    </div>
                    {intensity === opt.id && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Priority */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                Step 3 of 3: Primary Priority
              </span>
              <h4 className="text-lg font-black text-stone-900 dark:text-white">
                What matters most to you in this setup?
              </h4>
              <div className="space-y-2.5 pt-2">
                {[
                  { id: 'power', label: 'Sustained Power & Zero Throttling', desc: 'Power through heavy workloads without thermal or motor output dips.' },
                  { id: 'comfort', label: 'Ergonomics, Lightweight & Low Noise', desc: 'Extended sessions without operator fatigue or acoustic irritation.' },
                  { id: 'battery', label: 'Ecosystem Longevity & Fast Charging', desc: 'Versatile battery platforms and swift turnaround between tasks.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPriority(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      priority === opt.id 
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500' 
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{opt.label}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</p>
                    </div>
                    {priority === opt.id && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Results */}
          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                  Personalized Lab Match
                </span>
                <h4 className="text-lg font-black text-stone-900 dark:text-white mt-1">
                  We found the exact shootout for your needs!
                </h4>
              </div>

              {recommendedPost && (
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                      {recommendedPost.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      Lab Rating: {recommendedPost.quickVerdict?.overallScore} / 10
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {recommendedPost.title}
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                    {recommendedPost.excerpt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-stone-50 dark:bg-stone-850 px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>See My Recommendation</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <span>Open Lab Review</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
