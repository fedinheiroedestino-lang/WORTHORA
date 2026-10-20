import React, { useState } from 'react';
import { 
  Search, 
  Lock, 
  Menu, 
  X, 
  Sparkles, 
  Wrench, 
  Cpu, 
  Headphones, 
  Shirt, 
  Home, 
  Heart,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { CategorySlug } from '../types';
import { TranslationBar } from './TranslationBar';
import worthoraLogo from '../assets/images/worthora_logo.jpg';

interface HeaderProps {
  currentCategory: CategorySlug;
  onSelectCategory: (cat: CategorySlug) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenQuiz?: () => void;
  isAdminLoggedIn: boolean;
  onNavigatePage?: (page: 'about' | 'editorial' | 'privacy' | 'terms' | 'contact') => void;
  postCounts?: Record<string, number>;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAdmin,
  onOpenQuiz,
  isAdminLoggedIn,
  onNavigatePage,
  postCounts
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('worthora_theme') || localStorage.getItem('omniverdict_theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('worthora_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('worthora_theme', 'light');
    }
  };

  const navCategories: { slug: CategorySlug; label: string; icon: any }[] = [
    { slug: 'all', label: 'All Reviews', icon: Sparkles },
    { slug: 'electronics', label: 'Electronics', icon: Cpu },
    { slug: 'tools', label: 'Tools', icon: Wrench },
    { slug: 'clothing', label: 'Clothing', icon: Shirt },
    { slug: 'home-decoration', label: 'Home and Decoration', icon: Home },
    { slug: 'personal-care', label: 'Personal Care', icon: Heart },
    { slug: 'books', label: 'Books', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Notification / Deal Ticker */}
      <div className="bg-stone-900 text-stone-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
              Live Deals
            </span>
            <span className="text-stone-300 truncate">
              Spring Hardware & Appliance Event: Save up to $180 on cordless drill kits and smart robotic cleaners.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-stone-400 shrink-0 text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              100% Independent Lab Testing
            </span>
            <span className="text-stone-600">|</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Daily Google AI Updates
            </span>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Editorial Brand */}
          <div 
            onClick={() => onSelectCategory('all')} 
            className="cursor-pointer flex items-center gap-3 group notranslate"
            translate="no"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-500/30 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0 bg-stone-900 flex items-center justify-center">
              <img 
                src={worthoraLogo} 
                alt="Worthora Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="notranslate text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-sans tracking-wide" 
                  translate="no"
                >
                  WORTHORA
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
                  Verified Reviews
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium tracking-wide hidden sm:block">
                The Gold Standard in Consumer Reviews & Buyer Guides
              </p>
            </div>
          </div>

          {/* Action buttons (Search & Admin Gate) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs sm:text-sm font-medium transition cursor-pointer border border-stone-200/60"
              title="Search reviews and comparisons"
            >
              <Search className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">Search products...</span>
              <kbd className="hidden md:inline-block bg-white text-stone-600 font-mono text-[10px] px-1.5 py-0.5 rounded border border-stone-200">
                ⌘K
              </kbd>
            </button>

            {/* Instant Page Translation Selector */}
            <TranslationBar variant="header" />

            {/* Buyer Recommendation Quiz Trigger */}
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold transition cursor-pointer border border-amber-400/30"
                title="Assistente Interativo de Compra"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Quiz do Comprador</span>
              </button>
            )}

            {/* Dark Mode Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Stealth Admin Access Door (Small, discreet, secret keyhole) */}
            <button
              onClick={onOpenAdmin}
              className="relative p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="System"
              aria-label="System access"
            >
              <Lock className="w-3.5 h-3.5" />
              {isAdminLoggedIn && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category Navigation Strip with Tab Organization & Post Counts */}
        <nav className="flex items-center gap-1.5 py-2 border-t border-stone-100 overflow-x-auto scrollbar-none scroll-smooth">
          {navCategories.map(cat => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.slug;
            const count = postCounts?.[cat.slug];
            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                title={`Ver postagens organizadas em ${cat.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-700'}`} />
                <span>{cat.label}</span>
                {typeof count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    isActive
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-200/80 text-stone-600 group-hover:bg-stone-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider px-2 mb-2">
            Categorias & Guias de Teste
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {navCategories.map(cat => {
              const Icon = cat.icon;
              const isActive = currentCategory === cat.slug;
              const count = postCounts?.[cat.slug];
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-left transition ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-600'}`} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {typeof count === 'number' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1.5 ${
                      isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
