import React, { useState, useEffect } from 'react';
import { Languages, Check, Globe } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (Original)', flag: '🇺🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
];

interface TranslationBarProps {
  variant?: 'header' | 'floating' | 'inline';
  className?: string;
}

export const TranslationBar: React.FC<TranslationBarProps> = ({ variant = 'header', className = '' }) => {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check existing googtrans cookie
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const cookieVal = getCookie('googtrans');
    if (cookieVal) {
      const parts = cookieVal.split('/');
      const code = parts[parts.length - 1];
      if (code && SUPPORTED_LANGUAGES.some(l => l.code === code)) {
        setCurrentLang(code);
      }
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Set Google Translate cookie
    const cookieString = langCode === 'en' 
      ? 'googtrans=null; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      : `googtrans=/en/${langCode}; path=/;`;
    
    document.cookie = cookieString;
    document.cookie = `${cookieString} domain=${window.location.hostname};`;

    // Try finding the Google combo element
    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      // Reload page to apply translation cookie if widget not initialized
      window.location.reload();
    }
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // FLOATING BOTTOM-RIGHT WIDGET
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-5 right-5 z-40 ${className}`}>
        {isOpen && (
          <div 
            className="fixed inset-0 z-30 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
        )}
        <div className="relative z-40">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-2xl border border-amber-500/40 transition active:scale-95 cursor-pointer"
            title="Translate Page / Traduzir Página"
          >
            <span className="text-base">{selectedLangObj.flag}</span>
            <span className="hidden sm:inline">
              {currentLang === 'pt' ? 'Traduzido (PT)' : 'Translate'}
            </span>
          </button>

          {isOpen && (
            <div className="absolute bottom-12 right-0 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 text-xs space-y-1 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between text-stone-500 font-mono text-[10px] uppercase">
                <span>Select Language</span>
                <span>Google Translate</span>
              </div>
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {currentLang === lang.code && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // HEADER DROPDOWN
  return (
    <div className={`relative ${className}`}>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      <div className="relative z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold transition cursor-pointer border border-stone-200/80"
          title="Translate Page / Traduzir Página"
        >
          <span className="text-sm">{selectedLangObj.flag}</span>
          <span className="hidden md:inline">{selectedLangObj.name}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 text-xs space-y-1 z-50 animate-fadeIn">
            <div className="px-3 py-1.5 border-b border-stone-100 text-stone-500 font-mono text-[10px] uppercase flex items-center justify-between">
              <span>Translate Page</span>
              <span>Google AI</span>
            </div>
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                  currentLang === lang.code
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {currentLang === lang.code && <Check className="w-4 h-4 text-amber-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
