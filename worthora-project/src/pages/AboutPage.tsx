import React from 'react';
import { Microscope, Award, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import worthoraLogo from '../assets/images/worthora_logo.jpg';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-12 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviews</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-stone-200">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/30 shadow-md shrink-0 bg-stone-900 flex items-center justify-center">
            <img 
              src={worthoraLogo} 
              alt="Worthora Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Testing Lab Facility
              </span>
              <span className="text-xs text-stone-500 font-mono">Worthora Technical Institute</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              About Worthora & Our Testing Methodology
            </h1>
            <p className="text-base sm:text-lg text-stone-600 font-serif leading-relaxed">
              Worthora is an independent consumer product evaluation and review publication dedicated to evaluating electronics, tools, clothing, home & decor, personal care, and books with laboratory precision.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1.5">Bench-Tested Real Specs</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We verify manufacturer torque in-lbs, true battery capacity in watt-hours, decibel acoustic levels, and thermal throttling under continuous load.
            </p>
          </div>

          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1.5">No Sponsored Scores</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We never accept paid reviews or promotional score adjustments from brands. Products are purchased through retail channels or anonymized evaluation loans.
            </p>
          </div>

          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1.5">Google AI Daily Telemetry</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our intelligent autonomous algorithms cross-reference hundreds of verified user failure points, replacement part availability, and firmware updates daily.
            </p>
          </div>
        </div>

        {/* Lab Equipment Section */}
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h2 className="text-xl font-black text-stone-900 pt-4">Our Hardware Laboratory Equipment</h2>
          <p>
            Unlike aggregator blogs that recycle manufacturer product descriptions, our testing bench utilizes commercial instrumentation:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <li className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Calibrated Torque Dynamometers (Up to 2,500 in-lbs)</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>FLIR Industrial Thermal Imaging Cameras</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Type 1 Acoustic Sound Level Meters (dBA)</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Yokogawa Digital Power Meters & Load Banks</span>
            </li>
          </ul>

          <h2 className="text-xl font-black text-stone-900 pt-6">Google AdSense Policy Commitment</h2>
          <p>
            Worthora complies strictly with Google AdSense Publisher Policies. All commercial units are clearly marked with &quot;Advertisement&quot; or &quot;Sponsored&quot; banners, ensuring readers always understand the boundary between editorial bench evaluations and advertiser offers.
          </p>
        </div>
      </div>
    </div>
  );
};
