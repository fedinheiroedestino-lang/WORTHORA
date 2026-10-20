import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface ReadingFeedbackProps { postId: string; }
export const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({ postId }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const value = localStorage.getItem(`feedback_${postId}`); if (value === 'yes' || value === 'no') setFeedback(value); }, [postId]);
  const handleVote = async (choice: 'yes' | 'no') => {
    if (feedback) return;
    setFeedback(choice); localStorage.setItem(`feedback_${postId}`, choice);
    const helpful = choice === 'yes';
    const win = window as any;
    if (typeof win.gtag === 'function') win.gtag('event', 'article_feedback', { post_id: postId, helpful });
    try { await fetch('/api/learning/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, helpful }) }); } catch { /* static hosting: the local choice remains, no success count is fabricated */ }
    setSaved(true);
  };
  return <div className="my-10 rounded-2xl border border-stone-800 bg-stone-900 p-6 text-white shadow-md sm:p-8">
    <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <div className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Editorial feedback</span><h4 className="text-base font-black sm:text-lg">Did this guide help your decision?</h4><p className="text-xs text-stone-300">Your anonymous response helps prioritize future source checks and rewrites.</p></div>
      <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">{!feedback ? <><button onClick={() => handleVote('yes')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 sm:flex-none"><ThumbsUp className="h-3.5 w-3.5" />Yes, helpful</button><button onClick={() => handleVote('no')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-300 sm:flex-none"><ThumbsDown className="h-3.5 w-3.5" />Needs improvement</button></> : <div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/60 px-4 py-2.5 text-xs font-bold text-emerald-400"><CheckCircle className="h-4 w-4" />{saved ? 'Feedback recorded.' : 'Thank you.'}</div>}</div>
    </div>
  </div>;
};
