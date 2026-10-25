import React from 'react';
import { CheckSquare, ShieldCheck, AlertCircle } from 'lucide-react';

interface BuyerChecklistCardProps {
  checklist?: string[];
  unverifiedNotes?: string[];
  winnerName: string;
}

export const BuyerChecklistCard: React.FC<BuyerChecklistCardProps> = ({
  checklist = [],
  unverifiedNotes = [],
  winnerName
}) => {
  if ((!checklist || checklist.length === 0) && (!unverifiedNotes || unverifiedNotes.length === 0)) {
    return null;
  }

  return (
    <section className="my-8 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-6 sm:p-7 text-emerald-950">
      <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-200/80 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-950">
            Buyer Decision Checklist
          </h3>
          <p className="text-xs text-emerald-800">
            Verify these critical practical criteria before purchasing on Amazon US:
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs sm:text-sm">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 bg-white/70 p-3 rounded-xl border border-emerald-100">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="leading-snug text-emerald-900">{item}</span>
          </div>
        ))}
      </div>

      {unverifiedNotes && unverifiedNotes.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Price & Availability Notice:</strong> {unverifiedNotes.join(' ')} Always verify the total price, seller rating, and return window at checkout.
          </div>
        </div>
      )}
    </section>
  );
};
