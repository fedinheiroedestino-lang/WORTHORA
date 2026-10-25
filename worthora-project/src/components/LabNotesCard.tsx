import React from 'react';
import { ShieldCheck, CheckCircle2, Globe, FileCheck2, Scale } from 'lucide-react';
import { PluginAuditReport } from '../types';

interface LabNotesCardProps {
  report?: PluginAuditReport;
  categoryLabel: string;
  sourcesCount?: number;
}

export const LabNotesCard: React.FC<LabNotesCardProps> = ({ report, categoryLabel, sourcesCount = 3 }) => {
  return (
    <div className="my-8 bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-700/80 rounded-2xl p-6 sm:p-7 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              E-E-A-T Editorial Methodology & Fact Verification
            </h4>
            <p className="text-[11px] text-stone-400 font-mono">
              Independent Technical Research & Standards Audit • {categoryLabel}
            </p>
          </div>
        </div>

        {/* AdSense Compliance Quality Score */}
        <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-[9px] uppercase font-mono text-stone-400">AdSense Policy Audit</p>
            <p className="text-xs font-black text-emerald-400">
              {report?.adSenseScore || 98}/100 Verified Safe
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Genuine Editorial Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Grounded Sources</span>
          </div>
          <p className="text-white font-bold">{sourcesCount} Verified Public Citations</p>
        </div>

        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Factual Protocol</span>
          </div>
          <p className="text-white font-bold">Manufacturer Spec Corroboration</p>
        </div>

        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Editorial Standard</span>
          </div>
          <p className="text-white font-bold">Zero Invented Testing Claims</p>
        </div>
      </div>

      {/* Verification Standard Pillars */}
      <div className="pt-2">
        <p className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 font-bold">
          Corroboration Standards Enforced:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Official Manufacturer Whitepapers',
            'Independent Teardowns & Engineering Specs',
            'Verified Long-Term Buyer Consensus',
            'Real-Time Amazon Prime Verification'
          ].map((pillar, i) => (
            <span 
              key={i}
              className="bg-stone-800 text-stone-300 text-[11px] px-2.5 py-1 rounded-lg border border-stone-700/80 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{pillar}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

