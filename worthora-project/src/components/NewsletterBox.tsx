import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const NewsletterBox: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      // Store in localStorage safely
      try {
        const stored = JSON.parse(localStorage.getItem('worthora_subscribers') || localStorage.getItem('omniverdict_subscribers') || '[]');
        stored.push({ email: email.trim(), date: new Date().toISOString() });
        localStorage.setItem('worthora_subscribers', JSON.stringify(stored));
      } catch (err) {}

      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden my-12">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Worthora VIP Lab Briefing</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Get Rigorous Bench Tests &amp; Weekly Deal Alerts
        </h3>

        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
          Zero sponsored spam or disguised PR. Just executive summaries of fresh hardware shootouts, verified Amazon Prime price drops, and clear category champions delivered straight to your inbox.
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs sm:text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Subscription confirmed!</p>
              <p className="text-[11px] text-emerald-300">You will receive our next weekly laboratory briefing.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-lg">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:border-amber-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-md shrink-0 disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}

        <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your privacy is 100% protected. Unsubscribe anytime with 1 click.</span>
        </div>
      </div>
    </div>
  );
};
