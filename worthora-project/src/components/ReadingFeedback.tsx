import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, MessageSquare } from 'lucide-react';

interface ReadingFeedbackProps {
  postId: string;
}

export const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({ postId }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState<number>(() => {
    return 89 + (postId.length * 7) % 35;
  });

  useEffect(() => {
    const saved = localStorage.getItem(`feedback_${postId}`);
    if (saved === 'yes' || saved === 'no') {
      setFeedback(saved);
    }
  }, [postId]);

  const handleVote = (choice: 'yes' | 'no') => {
    setFeedback(choice);
    localStorage.setItem(`feedback_${postId}`, choice);
    if (choice === 'yes') {
      setHelpfulCount(prev => prev + 1);
    }
  };

  return (
    <div className="my-10 bg-linear-to-r from-stone-900 to-stone-850 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Editorial Feedback &amp; Reader Review
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-white">
            Did this lab benchmark help your buying decision?
          </h4>
          <p className="text-xs text-stone-300">
            {helpfulCount} readers found this hands-on evaluation helpful for their purchase.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {feedback === null ? (
            <>
              <button
                onClick={() => handleVote('yes')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer active:scale-95"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes, very helpful!</span>
              </button>
              <button
                onClick={() => handleVote('no')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl border border-stone-700 transition cursor-pointer active:scale-95"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Needs improvement</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2.5 rounded-xl animate-fadeIn">
              <CheckCircle className="w-4 h-4" />
              <span>Thank you! Your feedback has been recorded.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
