import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Tag,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Post, CategorySlug, AdSenseConfig, AutonomousSchedulerStatus, BLOG_CATEGORIES } from '../types';
import { CATEGORIES } from '../data/seedPosts';
import { PostCard } from '../components/PostCard';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { StructuredData } from '../components/StructuredData';
import { NewsletterBox } from '../components/NewsletterBox';
import { updateMetaForCategory } from '../utils/seo';

interface HomePageProps {
  posts: Post[];
  selectedCategory: CategorySlug;
  onSelectCategory: (cat: CategorySlug) => void;
  onSelectPost: (post: Post) => void;
  adSenseConfig?: AdSenseConfig;
  autonomousStatus?: AutonomousSchedulerStatus;
  isAdminLoggedIn?: boolean;
  onEditPost?: (post: Post, mode?: 'simplified' | 'full') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  selectedCategory,
  onSelectCategory,
  onSelectPost,
  adSenseConfig,
  autonomousStatus,
  isAdminLoggedIn = false,
  onEditPost
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'score' | 'views'>('latest');
  const [minScore, setMinScore] = useState<number>(0);

  useEffect(() => {
    updateMetaForCategory(selectedCategory);
  }, [selectedCategory]);

  // Safe Multi-Field Search & Filter Pipeline
  const filteredPosts = posts.filter(post => {
    // Category match supporting primary and legacy slugs
    const catConfig = BLOG_CATEGORIES.find(c => c.slug === selectedCategory);
    const allowedSlugs: string[] = catConfig
      ? [catConfig.slug, ...(catConfig.legacySlugs || [])]
      : [selectedCategory];
    const matchesCategory = selectedCategory === 'all' || allowedSlugs.includes(post.category);
    if (!matchesCategory) return false;

    // Minimum Score filter
    if (minScore > 0 && (post.quickVerdict?.overallScore ?? 0) < minScore) {
      return false;
    }

    // Search query match (safe sanitized)
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.categoryLabel.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q)) ||
      post.products.some(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      )
    );
  }).sort((a, b) => {
    if (sortBy === 'score') {
      return (b.quickVerdict?.overallScore ?? 0) - (a.quickVerdict?.overallScore ?? 0);
    }
    if (sortBy === 'views') {
      return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    }
    // Default: latest date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Active Category information for header tab view
  const activeCategoryInfo = CATEGORIES.find(c => c.slug === selectedCategory);

  // Newest post created by date (by AI blog intelligence or editor)
  const latestPostOverall = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  // On the main page (All Reviews) without active search or score filter:
  // The newest post created stays highlighted in the hero section until the next one is created!
  const isMainPage = selectedCategory === 'all' && !searchQuery && minScore === 0;
  const featuredPost = isMainPage && latestPostOverall ? latestPostOverall : null;

  const regularPosts = featuredPost 
    ? filteredPosts.filter(p => p.id !== featuredPost.id)
    : filteredPosts;

  // Memoized post counts per category tab for navigation pills
  const postCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: posts.length,
      electronics: 0,
      tools: 0,
      clothing: 0,
      'home-decoration': 0,
      'personal-care': 0,
      books: 0
    };
    posts.forEach(p => {
      BLOG_CATEGORIES.forEach(cat => {
        if (cat.slug === 'all') return;
        const allowed = [cat.slug, ...(cat.legacySlugs || [])];
        if (allowed.includes(p.category)) {
          counts[cat.slug] = (counts[cat.slug] || 0) + 1;
        }
      });
    });
    return counts;
  }, [posts]);

  const trendingPosts = [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 4);

  // Recommendations for zero-result fallback
  const topRecommendations = [...posts].sort((a, b) => (b.quickVerdict?.overallScore ?? 0) - (a.quickVerdict?.overallScore ?? 0)).slice(0, 3);

  const resetFilters = () => {
    setSearchQuery('');
    setMinScore(0);
    setSortBy('latest');
    onSelectCategory('all');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <StructuredData type="home" />

      {/* Top AdSense Leaderboard Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdSenseUnit format="leaderboard" config={adSenseConfig} category={selectedCategory} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Sub-Header Hero Banner */}
        <section className="bg-linear-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-stone-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Independent Laboratory Hardware Benchmarks</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Tested to the Limit. <br className="hidden sm:inline" />
              <span className="text-amber-400">Decided Without Bias.</span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              We torture-test power tools, smart home electronics, kitchen appliances, and domestic gear. Our calibrated dynos and thermal imagers provide definitive head-to-head buying verdicts.
            </p>

            {/* Instant Hero Search Bar */}
            <div className="pt-2">
              <div className="relative max-w-2xl bg-white rounded-2xl shadow-xl p-1.5 flex items-center border border-stone-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition">
                <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Find reviews, shootouts, or products (e.g. DeWalt, Ninja, cordless vacuum)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium outline-hidden bg-transparent"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg mr-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popular Searches Quick Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
                <span className="text-stone-400 font-semibold text-[11px]">Trending Searches:</span>
                {['DeWalt vs Milwaukee', 'Ninja Air Fryer', 'Cordless Vacuum', 'Smart Lock', 'Miter Saw'].map(term => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-[11px] px-2.5 py-1 rounded-lg border border-stone-700 transition cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Sponsored Bias
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Continuous Autonomous Updates
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                Verified Retailer Pricing
              </span>
            </div>
          </div>
        </section>

        {/* Featured Story: Newest Post Stays in Highlight on Main Page Until Next Generation */}
        {featuredPost && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-wider">
                  Latest Lab Benchmark · Featured Spotlight
                </h2>
              </div>
              <span className="text-xs text-amber-950 bg-amber-100/90 px-3 py-1 rounded-full font-bold border border-amber-300/70 inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Automatically rotated on every new publication
              </span>
            </div>
            <PostCard 
              post={featuredPost} 
              onSelect={onSelectPost} 
              featured={true}
              isAdminLoggedIn={isAdminLoggedIn}
              onEdit={onEditPost ? (p) => onEditPost(p, 'simplified') : undefined}
            />
          </section>
        )}

        {/* Dedicated Category Hub Banner when browsing a specific Header Tab */}
        {selectedCategory !== 'all' && (
          <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                  <button 
                    onClick={() => onSelectCategory('all')}
                    className="hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Ver Todas as Análises
                  </button>
                  <span>•</span>
                  <span>Aba Selecionada no Cabeçalho</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                  <span>{activeCategoryInfo?.name || selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'Análise Organizada' : 'Análises Organizadas'}
                  </span>
                </h2>
                <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
                  {activeCategoryInfo?.description || 'Avaliações especializadas, comparativos de bancada e guias de compra independentes organizados nesta aba.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectCategory('all')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Ver Todas as Categorias
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter & Sorting Bar */}
        <section className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {([
              { slug: 'all', label: 'All Reviews' },
              { slug: 'electronics', label: 'Electronics' },
              { slug: 'tools', label: 'Tools' },
              { slug: 'clothing', label: 'Clothing' },
              { slug: 'home-decoration', label: 'Home and Decoration' },
              { slug: 'personal-care', label: 'Personal Care' },
              { slug: 'books', label: 'Books' }
            ] as const).map(cat => {
              const count = postCounts[cat.slug];
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  {typeof count === 'number' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Filters: Sort & Rating */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-800 outline-hidden cursor-pointer"
              >
                <option value="latest">Latest Tests</option>
                <option value="score">Highest Rated</option>
                <option value="views">Most Popular</option>
              </select>
            </div>

            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-800 outline-hidden cursor-pointer"
            >
              <option value="0">All Scores</option>
              <option value="9.0">Score 9.0+</option>
              <option value="9.4">Score 9.4+ (Top Choice)</option>
            </select>
          </div>
        </section>

        {/* Main Content Layout: Two-Column with Grid & Sticky AdSense Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column: Posts Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {searchQuery ? `Search Results for "${searchQuery}"` : (
                    selectedCategory === 'all' 
                      ? (featuredPost ? 'Outras Análises & Comparativos Publicados' : 'Todas as Análises Publicadas')
                      : `Todas as Postagens de ${activeCategoryInfo?.name || selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                  )}
                </h3>
                {searchQuery && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Showing matching evaluations across torque, thermal tests, and user rankings
                  </p>
                )}
              </div>
              <span className="text-xs text-stone-500 font-mono">
                {regularPosts.length} {regularPosts.length === 1 ? 'Guia Disponível' : 'Guias Disponíveis'}
              </span>
            </div>

            {/* If Results Found */}
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {regularPosts.map((post, idx) => (
                  <React.Fragment key={post.id}>
                    <PostCard 
                      post={post} 
                      onSelect={onSelectPost}
                      isAdminLoggedIn={isAdminLoggedIn}
                      onEdit={onEditPost ? (p) => onEditPost(p, 'simplified') : undefined}
                    />
                    
                    {/* High-Converting In-Feed AdSense unit after every 2 posts */}
                    {(idx + 1) % 2 === 0 && (
                      <div className="sm:col-span-2 my-2">
                        <AdSenseUnit format="in-feed" config={adSenseConfig} category={selectedCategory} post={post} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* ZERO-ERROR RECOVERY STATE (Never a dead-end) */
              <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-xl font-black text-stone-900">
                    {searchQuery
                      ? `No exact guides found for "${searchQuery}"`
                      : `No review guides published yet in ${selectedCategory === 'all' ? 'this filter' : selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    We didn&apos;t find an exact bench test matching your filters, but our team regularly evaluates hardware and consumer products across multiple categories.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Search &amp; Show All Guides</span>
                  </button>
                </div>

                {/* Top Recommended Guides */}
                <div className="pt-6 border-t border-stone-100 text-left">
                  <p className="text-xs font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Recommended Benchmark Tests You Might Like:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {topRecommendations.map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => onSelectPost(rec)}
                        className="group bg-stone-50 hover:bg-amber-50/50 border border-stone-200 rounded-xl p-3 cursor-pointer transition"
                      >
                        <p className="text-[10px] font-mono text-amber-700 font-bold uppercase">{rec.categoryLabel}</p>
                        <h5 className="text-xs font-bold text-stone-900 line-clamp-2 mt-1 group-hover:text-amber-800 transition">
                          {rec.title}
                        </h5>
                        <p className="text-[11px] text-emerald-600 font-bold mt-2">
                          ★ {rec.quickVerdict?.overallScore} / 10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* In-Article / Mid Content Ad Placement */}
            <AdSenseUnit format="in-article" config={adSenseConfig} category={selectedCategory} />

            {/* VIP Lab Reports Newsletter Box */}
            <NewsletterBox />
          </div>

          {/* Sidebar Column: Ads & Highlights (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sticky Sidebar Skyscraper Ad (300x600) */}
            <div className="sticky top-28 space-y-6">
              <AdSenseUnit format="sidebar" config={adSenseConfig} category={selectedCategory} />

              {/* Trending Reviews Sidebar Widget */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                    Most Read Comparisons
                  </h4>
                </div>
                <div className="space-y-3.5">
                  {trendingPosts.map((tp, idx) => (
                    <div
                      key={tp.id}
                      onClick={() => onSelectPost(tp)}
                      className="group flex items-start gap-3 cursor-pointer"
                    >
                      <span className="text-stone-300 font-mono font-bold text-base leading-none w-4 shrink-0 mt-0.5 group-hover:text-amber-500 transition">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                          {tp.categoryLabel}
                        </span>
                        <h5 className="text-xs font-bold text-stone-900 line-clamp-2 group-hover:text-amber-700 transition">
                          {tp.title}
                        </h5>
                        <span className="text-[11px] text-stone-600 font-mono mt-1 block">
                          ★ {tp.quickVerdict.overallScore} / 10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSS Feed & Fast Discovery Badge */}
              <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Stay Updated</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Subscribe to our live RSS feed or XML sitemap to get autonomous and verified lab test reports automatically.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <a
                    href="/rss.xml"
                    target="_blank"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition"
                  >
                    RSS Feed
                  </a>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-lg border border-stone-700 transition"
                  >
                    Sitemap XML
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
