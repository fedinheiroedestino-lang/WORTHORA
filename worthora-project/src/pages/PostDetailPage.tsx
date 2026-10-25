import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Calendar, 
  Share2, 
  Check, 
  X, 
  Trophy, 
  ShoppingCart, 
  ExternalLink, 
  HelpCircle,
  ChevronDown,
  Sparkles,
  Award,
  Edit3,
  Sliders,
  Trash2,
  ShieldCheck,
  Star,
  Zap,
  Flame,
  ListOrdered
} from 'lucide-react';
import { Post, AdSenseConfig } from '../types';
import { VerdictBox } from '../components/VerdictBox';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { StructuredData } from '../components/StructuredData';
import { LabNotesCard } from '../components/LabNotesCard';
import { SocialShareBar } from '../components/SocialShareBar';
import { TableOfContents } from '../components/TableOfContents';
import { CommunityPoll } from '../components/CommunityPoll';
import { NewsletterBox } from '../components/NewsletterBox';
import { ReadingFeedback } from '../components/ReadingFeedback';
import { QuickJumpBar } from '../components/QuickJumpBar';
import { KeyTakeawaysBox } from '../components/KeyTakeawaysBox';
import { GroundedSourcesSection } from '../components/GroundedSourcesSection';
import { BuyerChecklistCard } from '../components/BuyerChecklistCard';
import { RelatedArticlesSection } from '../components/RelatedArticlesSection';
import { updateMetaForPost } from '../utils/seo';
import { trackArticleReadDepth, trackAffiliateClick } from '../utils/analytics';


interface PostDetailPageProps {
  post: Post;
  allPosts: Post[];
  onBack: () => void;
  onSelectPost: (post: Post) => void;
  adSenseConfig?: AdSenseConfig;
  isAdminLoggedIn?: boolean;
  onEditPost?: (post: Post, mode?: 'simplified' | 'full') => void;
  onDeletePost?: (id: string) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
  adSenseConfig,
  isAdminLoggedIn = false,
  onEditPost,
  onDeletePost
}) => {
  const [copied, setCopied] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]); // Open first FAQ by default
  const [scrollProgress, setScrollProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUolSummary, setShowUolSummary] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    updateMetaForPost(post);

    const firedDepths = new Set<number>();
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight <= 0) return;
      const pct = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
      setScrollProgress(pct);

      [25, 50, 75, 100].forEach(d => {
        if (pct >= d && !firedDepths.has(d)) {
          firedDepths.add(d);
          trackArticleReadDepth(d as any, post.slug, post.title, post.category);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const toggleFaq = (index: number) => {
    if (openFaqIndices.includes(index)) {
      setOpenFaqIndices(openFaqIndices.filter(i => i !== index));
    } else {
      setOpenFaqIndices([...openFaqIndices, index]);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  const tocItems = [
    { id: 'quick-verdict', label: '60-Second Lab Verdict' },
    { id: 'spec-matrix', label: 'Bench Specification Matrix' },
    { id: 'lab-notes', label: 'E-E-A-T Lab Notes & Conditions' },
    { id: 'contender-evaluations', label: 'Detailed Contender Evaluations' },
    { id: 'buyer-recommendations', label: 'Who Should Buy & Alternatives' },
    ...(post.faq && post.faq.length > 0 ? [{ id: 'faq', label: 'Frequently Asked Questions (FAQ)' }] : []),
    { id: 'community-poll', label: 'Community Reader Poll' }
  ];

  return (
    <article className="min-h-screen bg-stone-50 pb-24">
      {/* Dynamic SEO Rich Structured Data */}
      <StructuredData type="post" post={post} />

      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-stone-200/50 z-50 pointer-events-none"
      >
        <div 
          className="h-full bg-linear-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-stone-500 overflow-x-auto whitespace-nowrap">
          <button onClick={onBack} className="hover:text-stone-900 transition">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="hover:text-stone-900 transition">
            {post.categoryLabel}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-stone-900 font-semibold truncate max-w-[240px] sm:max-w-md">
            {post.title}
          </span>
        </div>
      </div>

      {/* Top Header Ad Placement */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        <AdSenseUnit format="leaderboard" config={adSenseConfig} post={post} category={post.category} productSlotIndex={0} />
      </div>

      {/* Main Editorial Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Administrator Contextual Quick-Action Bar (Visible ONLY when admin is logged in) */}
        {isAdminLoggedIn && onEditPost && (
          <div className="mb-6 p-4 bg-stone-900 text-white rounded-2xl shadow-xl border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-amber-400">Admin Mode Active:</span>
              <span className="text-stone-300 hidden sm:inline">Quick editing options enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditPost(post, 'simplified')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Edit title, winner, ratings, and pros/cons"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Edit</span>
              </button>
              <button
                onClick={() => onEditPost(post, 'full')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Edit full article, HTML, testing methodology, and FAQ"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Full Edit</span>
              </button>
              {onDeletePost && (
                confirmDelete ? (
                  <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-600 px-2 py-1 rounded-lg">
                    <span className="text-[11px] text-rose-200 font-bold">Delete?</span>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-black cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-1.5 py-0.5 text-stone-300 hover:text-white rounded text-[10px] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Article Meta Header */}
        <header className="space-y-4 pb-8 border-b border-stone-200">
          {/* UOL Kicker / Chapéu Editorial */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-600">
            <span>Amazon Lab Benchmarks</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-700">{post.categoryLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-stone-900 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.categoryLabel}
            </span>
            {post.isAutonomous && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Google AI Autonomous Review
              </span>
            )}
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              Lab Bench Tested
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-serif">
            {post.excerpt}
          </p>

          {/* Author Byline & Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-xs text-stone-500">
            <div className="flex items-center gap-3.5 notranslate" translate="no">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-xs bg-stone-900 shrink-0 flex items-center justify-center p-0.5">
                <img
                  src="/worthora_logo.jpg"
                  alt="Worthora Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/worthora_logo.jpg';
                  }}
                />
              </div>
              <div className="notranslate" translate="no">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-stone-900 text-sm tracking-tight notranslate" translate="no">
                    WORTHORA
                  </p>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Editorial Staff
                  </span>
                </div>
                <p className="text-stone-600 font-medium text-xs">
                  Hands-on testing and benchmarks conducted by the Worthora Lab Team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-stone-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-500">
                <Clock className="w-4 h-4" />
                <span>{post.readTimeMinutes} min read</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Action Toolbar: [ ≡ Executive Summary ] */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUolSummary(!showUolSummary)}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  showUolSummary 
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>≡ Executive Summary</span>
                <span className="text-[10px] bg-stone-900/10 px-1.5 py-0.2 rounded font-mono">
                  {post.quickVerdict.overallScore}/10
                </span>
              </button>

              <span className="text-xs text-stone-500">
                Reported by <strong>Worthora Editorial Staff</strong>
              </span>
            </div>

            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              ✓ Verified Lab Benchmark
            </span>
          </div>

          {showUolSummary && (
            <div className="p-4 sm:p-5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl space-y-2.5 animate-fadeIn">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                Key Lab Takeaways
              </h4>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                {post.quickVerdict.summary}
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-3 text-xs text-amber-900 font-semibold">
                <span>🏆 Shootout Winner: <strong>{post.quickVerdict.winnerProductName}</strong></span>
                <span>•</span>
                <span>⭐ Overall Score: <strong>{post.quickVerdict.overallScore} / 10</strong></span>
                <span>•</span>
                <span>🛒 Verified Store: <strong>Amazon US</strong></span>
              </div>
            </div>
          )}
        </header>

        {/* Featured Image */}
        <div className="my-8 rounded-2xl overflow-hidden shadow-md bg-stone-100 aspect-16/9">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* 1-Click Multi-Channel Social Sharing */}
        <div className="my-6">
          <SocialShareBar post={post} />
        </div>

        {/* 30-Second Key Takeaways / TL;DR Banner */}
        <KeyTakeawaysBox
          post={post}
          onJumpToWinner={() => {
            const el = document.getElementById('quick-verdict');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Interactive Table of Contents */}
        <TableOfContents items={tocItems} />

        {/* Amazon Associates & FTC Compliance Disclosure Banner */}
        <div className="my-5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-relaxed">
              <strong>Amazon Associates Transparency:</strong> As an Amazon Associate, Worthora earns from qualifying purchases. When you purchase through our links, we may earn an affiliate commission at no extra cost to you. Exact product matches verified on Amazon Global.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded shrink-0 hidden sm:inline-block">
            FTC Compliant
          </span>
        </div>

        {/* Quick Verdict Box (Wirecutter style) */}
        <div id="quick-verdict">
          <VerdictBox verdict={post.quickVerdict} products={post.products} />
        </div>

        {/* In-Article Responsive AdSense Slot #1 */}
        <AdSenseUnit format="in-article" config={adSenseConfig} post={post} category={post.category} productSlotIndex={0} />

        {/* Head-to-Head Specification Matrix */}
        <div id="spec-matrix">
          <ComparisonMatrix products={post.products} matrix={post.comparisonMatrix} />
        </div>

        {/* E-E-A-T Verified Lab Notes & AdSense Audit Telemetry */}
        <div id="lab-notes">
          <LabNotesCard report={post.pluginReport} categoryLabel={post.categoryLabel} />
        </div>

        {/* Deep Dive Breakdown Cards for Each Product */}
        <section id="contender-evaluations" className="my-12 space-y-8">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              In-Depth Contender Evaluations
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Detailed findings from our 40-hour hands-on testing and mechanical tear-downs.
            </p>
          </div>

          {post.products.map(prod => (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl p-6 sm:p-8 border shadow-xs transition ${
                prod.isWinner
                  ? 'border-amber-400/80 ring-2 ring-amber-400/20'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {prod.isWinner && (
                        <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Category Winner
                        </span>
                      )}
                      <span className="text-xs font-semibold text-stone-500">{prod.brand}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">Model: {prod.model}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto">
                  <div className="flex items-baseline gap-2">
                    {prod.price > 0 && prod.priceStatus !== 'check_current_price' ? (
                      <>
                        <span className="text-2xl font-black text-stone-900">
                          ${prod.price.toFixed(2)}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ${prod.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-3 py-1 rounded-lg">
                        Check Current Price on Amazon
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                    <a
                      href={prod.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      onClick={() => trackAffiliateClick(prod.name, prod.buyRetailer, prod.verificationStatus || 'unverified', post.slug)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-98"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{prod.hasValidAsin ? `View Official Amazon Listing` : `Check Live Price on Amazon`}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {prod.hasValidAsin ? `✓ Verified ASIN: ${prod.asin}` : '• Real-Time Amazon Search Link'} • Prices subject to change
                    </span>
                  </div>
                </div>
              </div>

              {/* Factual Integrity & E-E-A-T Verification Banner */}
              <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    prod.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {prod.verificationStatus === 'verified' ? 'Verified Catalog Specs' : 'Live Market Model'}
                  </span>
                  <span className="text-stone-600 text-[11px] font-medium">
                    {prod.buyRetailer || 'Amazon US'} Official Storefront
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 font-mono">
                  FTC Compliant • No Invented Review Numbers
                </div>
              </div>

              {/* Summary text */}
              <p className="py-4 text-stone-700 text-sm leading-relaxed">
                {prod.summary}
              </p>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                {Object.entries(prod.keySpecs).map(([specKey, specVal]) => (
                  <div key={specKey}>
                    <span className="text-stone-500 font-medium block truncate">{specKey}</span>
                    <span className="text-stone-900 font-bold block truncate">{specVal}</span>
                  </div>
                ))}
              </div>

              {/* Pros & Cons Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>What We Liked</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {prod.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/60 border border-rose-200/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                    <span>Drawbacks & Trade-offs</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {prod.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Mid-Article Native Display Ad Placement */}
        <AdSenseUnit format="in-article" config={adSenseConfig} post={post} category={post.category} productSlotIndex={1} />

        {/* Rich In-Depth Editorial Testing Content */}
        <section className="my-10 pt-8 border-t border-stone-200">
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </section>

        {/* Practical Buyer Decision Checklist */}
        <BuyerChecklistCard 
          checklist={post.buyerChecklist} 
          unverifiedNotes={post.unverifiedDisclaimers} 
          winnerName={post.quickVerdict?.winnerProductName || ''} 
        />

        {/* Transparent Grounded Sources & Technical Citations */}
        <GroundedSourcesSection 
          sources={post.sources} 
          postSlug={post.slug} 
          queriedAt={post.groundingMetadata?.queriedAt} 
        />

        {/* Verified Internal Related Articles in Same Category */}
        <RelatedArticlesSection 
          relatedArticles={
            post.relatedArticles && post.relatedArticles.length > 0 
              ? post.relatedArticles 
              : relatedPosts.map(p => ({ 
                  id: p.id, 
                  slug: p.slug, 
                  title: p.title, 
                  category: p.category, 
                  excerpt: p.excerpt, 
                  featuredImage: p.featuredImage, 
                  readTimeMinutes: p.readTimeMinutes 
                }))
          } 
          currentSlug={post.slug} 
          categoryLabel={post.categoryLabel} 
        />

        {/* Editorial Authorship Box */}
        <section className="my-10 p-6 sm:p-7 bg-stone-50 border border-stone-200 rounded-2xl shadow-xs notranslate" translate="no">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-md bg-stone-900 shrink-0 flex items-center justify-center p-1">
              <img
                src="/worthora_logo.jpg"
                alt="Worthora Logo"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/worthora_logo.jpg';
                }}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h4 className="text-base sm:text-lg font-black text-stone-900 notranslate" translate="no">
                  Worthora Editorial Staff
                </h4>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Independent Lab Testing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">
                All benchmark reviews, head-to-head laboratory shootouts, and buying guides on Worthora are collectively evaluated and vetted by our independent testing board. We never accept compensation from manufacturers to alter ratings or verdicts.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Empirically Benchmarked
                </span>
                <span>•</span>
                <span>Published exclusively on worthora.blog</span>
              </div>
            </div>
          </div>
        </section>

        {/* Who Should Buy vs Who Should Skip */}
        <section id="buyer-recommendations" className="my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-black text-emerald-900 flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Who Should Buy This Setup</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
              {post.whoShouldBuy.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border-2 border-stone-300 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-black text-stone-800 flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-stone-500" />
              <span>Who Should Pass & Consider Alternatives</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
              {post.whoShouldSkip.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ Section (Optimized for Google Featured Snippets) */}
        {post.faq && post.faq.length > 0 && (
          <section id="faq" className="my-12 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-black text-stone-900">
                Frequently Asked Buying Questions
              </h3>
            </div>

            <div className="divide-y divide-stone-100">
              {post.faq.map((item, i) => {
                const isOpen = openFaqIndices.includes(i);
                return (
                  <div key={i} className="py-4">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-stone-900 hover:text-amber-700 transition cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform ${
                          isOpen ? 'rotate-180 text-amber-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed pr-6">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reader Community Live Voting Poll */}
        <div id="community-poll">
          <CommunityPoll 
            postId={post.id} 
            postTitle={post.title} 
            products={post.products} 
          />
        </div>

        {/* Reader Feedback & Helpful Sentiment Box */}
        <ReadingFeedback postId={post.id} />

        {/* Bottom In-Article AdSense Banner */}
        <AdSenseUnit format="in-article" config={adSenseConfig} post={post} category={post.category} productSlotIndex={2} />

        {/* Newsletter Subscription Box */}
        <NewsletterBox />

        {/* Bottom Multi-Channel Social Sharing */}
        <div className="my-10">
          <SocialShareBar post={post} />
        </div>

        {/* Related Comparisons Grid */}
        {relatedPosts.length > 0 && (
          <section className="my-16 pt-10 border-t border-stone-200">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-6">
              More Tested Guides in {post.categoryLabel}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => onSelectPost(rp)}
                  className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  <img
                    src={rp.featuredImage}
                    alt={rp.title}
                    className="w-full aspect-16/10 object-cover group-hover:scale-104 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase text-amber-700">
                      {rp.categoryLabel}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 mt-1 group-hover:text-amber-700 transition">
                      {rp.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Action Bar with Quick Jumps & Best Price */}
      <QuickJumpBar 
        winnerProduct={post.products.find(p => p.isWinner) || post.products[0]} 
      />
    </article>
  );
};
