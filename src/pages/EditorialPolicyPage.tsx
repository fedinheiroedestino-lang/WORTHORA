import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Scale } from 'lucide-react';

interface EditorialPolicyPageProps {
  onBack: () => void;
}

export const EditorialPolicyPage: React.FC<EditorialPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviews</span>
        </button>

        <div className="flex items-center gap-3 pb-6 border-b border-stone-200">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Editorial Standards & Testing Ethics
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              E-E-A-T Editorial Guidelines & 10-Point Evaluation Scale
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>1. Complete Editorial Independence</span>
            </h2>
            <p>
              Worthora editors and specialists operate with complete editorial autonomy. Our testing scores, winners, and recommendations are NEVER influenced, pre-approved, or dictated by manufacturers, retailers, or PR agencies.
            </p>
            <p>
              Brands cannot purchase favorable scores, and our commercial team has zero input into which products win our shootouts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>2. The 10-Point Worthora Scoring Rubric</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block text-xs">9.0 – 10.0: Superior Champion</span>
                <span className="text-[11px] text-stone-600">Sets the industry benchmark. Class-leading reliability, build, and user ergonomics.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block text-xs">8.0 – 8.9: Excellent Value</span>
                <span className="text-[11px] text-stone-600">Performs admirably with minor trade-offs that do not impact core everyday reliability.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block text-xs">7.0 – 7.9: Acceptable / Niche</span>
                <span className="text-[11px] text-stone-600">Competent for budget-restricted buyers or specialized applications only.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block text-xs">Below 7.0: Not Recommended</span>
                <span className="text-[11px] text-stone-600">Failed bench stress tests, thermal shutdowns, or poor longevity metrics.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              3. Corrections & Verification
            </h2>
            <p>
              When a manufacturer updates firmware or updates internal hardware revisions, our testing bench re-evaluates the equipment and updates our guides accordingly with clear timestamp logs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
