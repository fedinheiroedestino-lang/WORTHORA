import React from 'react';
import { ShieldCheck, Award, FileText, CheckCircle2, Lock } from 'lucide-react';
import { CategorySlug } from '../types';
import worthoraLogo from '../assets/images/worthora_logo.jpg';

interface FooterProps {
  onSelectCategory: (cat: CategorySlug) => void;
  onOpenAdmin: () => void;
  onNavigatePage?: (page: 'about' | 'editorial' | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin, onNavigatePage }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-stone-800/80 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-900 text-amber-400 border border-stone-800 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Independent Bench Testing</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                We purchase or lab-loan every product directly. We do not accept paid manufacturer scores or sponsored placements.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-900 text-emerald-400 border border-stone-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Daily Autonomous Intelligence</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Our autonomous Google AI review engine scans real-world hardware telemetry, customer feedback, and price fluctuations daily.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-900 text-blue-400 border border-stone-800 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">AdSense & FTC Compliant</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                All advertising units adhere strictly to Google AdSense policies. Clear separation between editorial testing and advertiser slots.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-b border-stone-800/80">
          <div>
            <div className="flex items-center gap-3 mb-3 notranslate" translate="no">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/30 shadow-md shrink-0 bg-stone-900 flex items-center justify-center">
                <img 
                  src={worthoraLogo} 
                  alt="Worthora Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="notranslate text-xl font-black text-white tracking-wide" translate="no">
                WORTHORA
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              The premier consumer product evaluation portal for electronics, tools, clothing, home & decor, personal care, and books. Built to help consumers make confident purchasing decisions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Editorial Testing Board</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Review Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory('electronics')} className="text-stone-400 hover:text-white transition">
                  Electronics
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('tools')} className="text-stone-400 hover:text-white transition">
                  Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('clothing')} className="text-stone-400 hover:text-white transition">
                  Clothing
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('home-decoration')} className="text-stone-400 hover:text-white transition">
                  Home and Decoration
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('personal-care')} className="text-stone-400 hover:text-white transition">
                  Personal Care
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('books')} className="text-stone-400 hover:text-white transition">
                  Books
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Testing & Policies</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button 
                  onClick={() => onNavigatePage && onNavigatePage('about')}
                  className="hover:text-white cursor-pointer text-left"
                >
                  How We Bench-Test Hardware (About Us)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigatePage && onNavigatePage('editorial')}
                  className="hover:text-white cursor-pointer text-left"
                >
                  Editorial Guidelines & 10-Point Rubric
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigatePage && onNavigatePage('privacy')}
                  className="hover:text-white cursor-pointer text-left"
                >
                  AdSense Privacy & Cookie Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigatePage && onNavigatePage('terms')}
                  className="hover:text-white cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigatePage && onNavigatePage('contact')}
                  className="hover:text-white cursor-pointer text-left"
                >
                  Contact Editorial Board & Lab
                </button>
              </li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-white">XML Sitemap for Search Engines</a></li>
              <li><a href="/robots.txt" target="_blank" className="hover:text-white">Robots.txt</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Laboratory Credentials</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Independent benchmark testing facility and mechanical stress testing for consumer appliances, workshop tools, and electronics.
            </p>
            <p className="text-[11px] text-stone-500 font-mono">
              Calibrated dynamometers • FLIR thermography • Class-1 dBA acoustic meters
            </p>
          </div>
        </div>

        {/* FTC / AdSense Disclosure & Copyright */}
        <div className="pt-8 text-xs text-stone-400 space-y-3">
          <p className="leading-relaxed text-[11px]">
            <strong>Amazon Associates &amp; FTC Disclosure:</strong> Worthora is reader-supported. As an Amazon Associate, Worthora earns from qualifying purchases. When you purchase products through links on this website to Amazon Global or partner retailers, we may receive an affiliate commission at no extra cost to you. Ads served via Google AdSense are clearly marked and governed by Google&apos;s publisher policies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-stone-900 text-stone-400 text-[11px]">
            <p className="flex items-center">
              © {new Date().getFullYear()} Worthora Editorial Publication. All rights reserved.
              <button 
                onClick={onOpenAdmin} 
                className="text-stone-800 hover:text-stone-500 transition ml-2.5 cursor-pointer inline-flex items-center"
                title="System"
                aria-label="System"
              >
                <Lock className="w-2.5 h-2.5" />
              </button>
            </p>
            <p>Designed for fast indexing, rich snippets, and Google AdSense monetization.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
