import React from 'react';
import { ExternalLink, ShieldCheck, Clock, CheckCircle2, FileText, Globe } from 'lucide-react';
import { GroundedSource } from '../types';
import { trackSourceCitationClick } from '../utils/analytics';

interface GroundedSourcesSectionProps {
  sources?: GroundedSource[];
  postSlug: string;
  queriedAt?: string;
}

export const GroundedSourcesSection: React.FC<GroundedSourcesSectionProps> = ({ 
  sources = [], 
  postSlug, 
  queriedAt 
}) => {
  if (!sources || sources.length === 0) return null;

  const formattedDate = queriedAt 
    ? new Date(queriedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : 'Recent Live Audit';

  return (
    <section className="my-10 bg-linear-to-br from-stone-900 via-stone-900 to-stone-950 text-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Verified Sources & Grounded Citations</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                E-E-A-T Verified
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Corroborated against public engineering whitepapers and manufacturer documentation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-mono">Consulted: {formattedDate}</span>
        </div>
      </div>

      {/* Grounding Disclaimer */}
      <div className="mt-4 mb-6 p-3 bg-stone-800/60 rounded-xl border border-stone-700/40 text-xs text-stone-300 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Editorial Integrity Notice:</strong> Real-time Google Search Grounding is utilized to capture live documentation and technical specs. Grounding brings updated facts, but every assertion in this article underwent independent human editorial review to eliminate promotional hype and fake claims.
        </span>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sources.map((src, idx) => (
          <div 
            key={src.id || idx}
            className="p-4 bg-stone-850 rounded-xl border border-stone-700/70 hover:border-amber-500/50 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                  {src.domain}
                </span>
                <span className="text-[10px] text-stone-400">
                  Ref #{idx + 1}
                </span>
              </div>

              <h4 className="text-sm font-bold text-stone-100 group-hover:text-white transition leading-snug">
                {src.title}
              </h4>

              {/* Supported Claims */}
              {src.supportedClaims && src.supportedClaims.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  <p className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wide">
                    Supported Factual Claims:
                  </p>
                  <ul className="text-xs text-stone-300 space-y-1">
                    {src.supportedClaims.map((claim, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-stone-800 flex items-center justify-between">
              <a 
                href={src.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => trackSourceCitationClick(src.url, src.domain, src.supportedClaims?.[0] || 'Technical specification', postSlug)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
              >
                <span>View Original Source Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-stone-400 font-mono">Public Document</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
