import React from 'react';
import { Microscope, CheckCircle2, ShieldCheck, Thermometer, Clock, Sparkles } from 'lucide-react';
import { PluginAuditReport } from '../types';

interface LabNotesCardProps {
  report?: PluginAuditReport;
  categoryLabel: string;
}

export const LabNotesCard: React.FC<LabNotesCardProps> = ({ report, categoryLabel }) => {
  if (!report) return null;

  return (
    <div className="my-8 bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-700/80 rounded-2xl p-6 sm:p-7 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
            <Microscope className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              E-E-A-T Verified Bench Notes & Testing Conditions
            </h4>
            <p className="text-[11px] text-stone-400 font-mono">
              Independent Worthora Laboratory Protocols • {categoryLabel}
            </p>
          </div>
        </div>

        {/* AdSense Compliance Quality Score */}
        <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-[9px] uppercase font-mono text-stone-400">AdSense Policy Audit</p>
            <p className="text-xs font-black text-emerald-400">
              {report.adSenseScore}/100 Verified Safe
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Lab Testing Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Bench Test Duration</span>
          </div>
          <p className="text-white font-bold">{report.eeatLabNotes.testingHours} Hours Continuous Stress</p>
        </div>

        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Chamber Environment</span>
          </div>
          <p className="text-white font-bold truncate">{report.eeatLabNotes.ambientConditions}</p>
        </div>

        <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
          <div className="flex items-center gap-1.5 text-stone-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Original Word Count</span>
          </div>
          <p className="text-white font-bold">{report.wordCount} Words (Deep Evaluation)</p>
        </div>
      </div>

      {/* Calibration Instruments Used */}
      <div className="pt-2">
        <p className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 font-bold">
          Precision Instruments & Telemetry Used:
        </p>
        <div className="flex flex-wrap gap-2">
          {report.eeatLabNotes.instrumentsUsed.map((inst, i) => (
            <span 
              key={i}
              className="bg-stone-800 text-stone-300 text-[11px] px-2.5 py-1 rounded-lg border border-stone-700/80 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{inst}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
