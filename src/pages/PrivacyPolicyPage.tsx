import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Privacy & Cookie Policy
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Last updated: October 2026 • Compliant with Google AdSense Policies & GDPR
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">1. Introduction</h2>
            <p>
              At Worthora (accessible from worthora.blog), the privacy of our visitors is of paramount importance. This Privacy Policy document outlines the types of information that is collected and recorded by Worthora and how we utilize it in compliance with Google AdSense publisher requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">2. Google AdSense & DoubleClick DART Cookies</h2>
            <p>
              Google is a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to worthora.blog and other sites on the internet.
            </p>
            <p>
              Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-medium">https://policies.google.com/technologies/ads</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">3. Log Files & Analytics</h2>
            <p>
              Worthora follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">4. Advertising Partners & Affiliate Disclosures</h2>
            <p>
              Some of the advertisers and partners on our site may use cookies and web beacons. Our advertising partners include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google AdSense:</strong> Contextual and personalized ad displays.</li>
              <li><strong>Amazon Associates:</strong> FTC-compliant product referral links.</li>
            </ul>
            <p>
              Each of our advertising partners has their own Privacy Policy for their policies on user data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">5. CCPA & GDPR Privacy Rights</h2>
            <p>
              We ensure every user is entitled to the right to access, rectification, erasure, and restriction of data processing. If you make a request, we have one month to respond to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
