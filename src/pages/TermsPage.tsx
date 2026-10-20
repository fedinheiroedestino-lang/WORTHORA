import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Terms of Service
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Worthora Terms & Conditions • Governed under Consumer Protection Standards
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Welcome to Worthora. By accessing this website (worthora.blog), you agree to be bound by these Terms of Service, all applicable laws, and regulations.
          </p>

          <h3 className="font-bold text-stone-900 text-base">1. Intellectual Property & License</h3>
          <p>
            Permission is granted to view the benchmark data, comparisons, and buyer guides for personal, non-commercial transitory viewing only. You may not republish full testing matrices or automated articles without written attribution.
          </p>

          <h3 className="font-bold text-stone-900 text-base">2. Disclaimer of Liability</h3>
          <p>
            The materials on Worthora are provided on an &apos;as is&apos; basis. While we strive for rigorous precision in our physical testing chambers, real-world workshop conditions and manufacturer tolerances may vary. Always observe all safety rules when operating power tools, high-voltage battery stations, or domestic heating appliances.
          </p>
        </div>
      </div>
    </div>
  );
};
