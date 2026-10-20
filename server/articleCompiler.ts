import fs from 'fs';
import path from 'path';
import { Post, CategorySlug } from '../src/types';
import { runIntelligentPluginsPipeline } from '../server/automationPlugins';
import { findBestAmazonAdDeal, calculateAmazonCommission } from '../server/affiliateEngine';
import { DEFAULT_AFFILIATE_CONFIG } from '../server/affiliateEngine';
import { getSettings } from '../server/storage';
import { getLearnedModel, saveLearnedModel } from '../server/learnedModelTemplate';

export interface RawArticleSpec {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  categoryLabel: string;
  excerpt: string;
  readTimeMinutes: number;
  publishedAt: string;
  featuredImage: string;
  isFeatured?: boolean;
  quickVerdict: {
    summary: string;
    overallScore: number;
    verdictBadge: string;
    winnerProductName: string;
    subRatings: { category: string; score: number }[];
  };
  prod1: {
    name: string;
    brand: string;
    model: string;
    price: number;
    originalPrice: number;
    rating: number;
    awardBadge: string;
    asin: string;
    summary: string;
    specs: Record<string, string>;
    pros: string[];
    cons: string[];
    isWinner: boolean;
  };
  prod2: {
    name: string;
    brand: string;
    model: string;
    price: number;
    originalPrice: number;
    rating: number;
    awardBadge: string;
    asin: string;
    summary: string;
    specs: Record<string, string>;
    pros: string[];
    cons: string[];
    isWinner: boolean;
  };
  matrix: { feature: string; values: string[]; winnerIndex: number }[];
  leadParagraph: string;
  bullets: string[];
  methodologyParagraphs: string[];
  winnerParagraphs: string[];
  runnerUpParagraphs: string[];
  fourPillars: { pillar: string; text: string }[];
  fichaGrid: { label: string; value: string }[];
  verdictParagraphs: string[];
  whoShouldBuy: string[];
  whoShouldSkip: string[];
  faq: { question: string; answer: string }[];
  tags: string[];
}

// Helper to assemble full rich HTML containing > 1,000 words
function buildContentHtml(spec: RawArticleSpec): string {
  const bulletsHtml = spec.bullets.map(b => `<li>${b}</li>`).join('');
  const methodologyHtml = spec.methodologyParagraphs.map(p => `<p>${p}</p>`).join('');
  const winnerHtml = spec.winnerParagraphs.map(p => `<p>${p}</p>`).join('');
  const runnerUpHtml = spec.runnerUpParagraphs.map(p => `<p>${p}</p>`).join('');
  
  const pillarsHtml = spec.fourPillars.map(p => `
    <div class="pillar-breakdown mb-4">
      <h3 class="text-lg font-bold text-stone-900">${p.pillar}</h3>
      <p class="text-stone-700 leading-relaxed mt-1">${p.text}</p>
    </div>
  `).join('');

  const fichaHtml = spec.fichaGrid.map(f => `<p><strong>${f.label}:</strong> ${f.value}</p>`).join('');
  const verdictHtml = spec.verdictParagraphs.map(p => `<p>${p}</p>`).join('');

  return `
    <p class="uol-lead">${spec.leadParagraph}</p>
    
    <div class="uol-bullets-summary">
      <h3 class="text-base font-bold text-amber-900 mb-2 uppercase tracking-wide">Worthora Lab Bench Highlights & Key Takeaways</h3>
      <ul>${bulletsHtml}</ul>
    </div>

    <h2>Worthora Lab 40-Hour Stress Test & Bench Protocol</h2>
    ${methodologyHtml}

    <h2>In-Depth Champion Breakdown: ${spec.prod1.isWinner ? spec.prod1.name : spec.prod2.name}</h2>
    ${winnerHtml}

    <h2>The Contender Breakdown: Real Strengths & Trade-Offs: ${!spec.prod1.isWinner ? spec.prod1.name : spec.prod2.name}</h2>
    ${runnerUpHtml}

    <h2>Head-to-Head Showdown Across 4 Decisive Pillars</h2>
    ${pillarsHtml}

    <div class="uol-ficha-tecnica">
      <h3>STANDARDIZED LAB BENCH SPECIFICATION SHEET</h3>
      <div class="ficha-grid">
        ${fichaHtml}
      </div>
    </div>

    <h2>Real-World Everyday Scenarios: How They Fit Your Routine</h2>
    <p>A lab benchmark is only as valuable as its relevance to your actual daily routine. Here is exactly how both contenders behaved when taken off the test bench and thrust into demanding, real-world North American environments:</p>
    <ul>
      <li><strong>The Busy Morning Rush & Daily Commute:</strong> How quickly each device powers on, handles jostling inside a crowded backpack on the subway, or responds when you only have 5 minutes before walking out the front door.</li>
      <li><strong>Sustained Work & Long-Haul Travel:</strong> Thermal stability during uninterrupted 4-hour work blocks, quiet acoustics that will not disturb family members or coworkers in shared home offices, and battery performance built to survive cross-country flights without hunting for wall outlets.</li>
      <li><strong>Weekend Projects & Stress Conditions:</strong> Real resilience against accidental table drops, temperature swings in unheated garages or humid outdoor decks, and ease of routine cleaning without needing specialized disassembly tools.</li>
    </ul>

    <h2>Longevity, Build Durability & US Warranty Protection</h2>
    <p>In the Worthora testing facility, we evaluate products not just on day-one unboxing excitement, but on how materials hold up after months of heavy thermal and mechanical cycling. We inspect reinforced stress joints, check seal integrity against dust and moisture, and confirm readily available replacement parts through authorized North American distributors.</p>
    <p>For your purchase security, we strongly recommend ordering through verified Amazon.com official stores. This guarantees authentic factory-sealed hardware, eligibility for fast Amazon Prime 2-day delivery, seamless 30-day hassle-free returns, and full coverage under North American manufacturer warranties.</p>

    <h2>Who Should Buy & Who Should Pass</h2>
    <div class="my-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
      <h3 class="text-base font-bold text-amber-950 mb-2">⏱️ 10-Second Decision Pause: Which Contender Fits Your Life?</h3>
      <p class="text-sm text-stone-800 leading-relaxed">
        <strong>Choose the ${spec.prod1.isWinner ? spec.prod1.name : spec.prod2.name} if:</strong> You demand maximum sustained performance, zero thermal throttling, premium tactile materials, and the peace of mind that comes with lab-tested durability for daily professional or enthusiast use.
      </p>
      <p class="text-sm text-stone-800 leading-relaxed mt-2">
        <strong>Choose the ${!spec.prod1.isWinner ? spec.prod1.name : spec.prod2.name} if:</strong> You want an accessible entry price, travel-friendly compact dimensions, and your daily demands do not require pushing the hardware into sustained peak stress.
      </p>
    </div>

    <h2>Editorial Verdict & Final Buying Advice</h2>
    ${verdictHtml}

    <div class="transparencia-editorial mt-8 p-4 bg-stone-100 rounded-lg text-xs text-stone-600 border border-stone-200">
      <p><strong>Editorial Independence & FTC Disclosure:</strong> Worthora is reader-supported. We independently purchase or test all evaluated hardware on calibrated bench rigs without manufacturer influence, paid placements, or sponsored scoring. When you purchase through verified Amazon links on our site, we may earn an affiliate commission at zero additional cost to you. These commissions directly fund our independent testing lab, power analyzers, and acoustic instrumentation.</p>
    </div>
  `.trim();
}

export function compileRawArticle(spec: RawArticleSpec): Post {
  const contentHtml = buildContentHtml(spec);
  const currentSettings = getSettings();
  const affConfig = currentSettings?.affiliates || DEFAULT_AFFILIATE_CONFIG;

  const deal1 = findBestAmazonAdDeal(spec.prod1.name, spec.prod1.brand, spec.prod1.model, spec.category, spec.prod1.price, affConfig);
  const comm1 = calculateAmazonCommission(spec.category, spec.prod1.price);

  const deal2 = findBestAmazonAdDeal(spec.prod2.name, spec.prod2.brand, spec.prod2.model, spec.category, spec.prod2.price, affConfig);
  const comm2 = calculateAmazonCommission(spec.category, spec.prod2.price);

  const p1 = {
    id: `${spec.id}-p1`,
    name: spec.prod1.name,
    brand: spec.prod1.brand,
    model: spec.prod1.model,
    price: spec.prod1.price,
    originalPrice: spec.prod1.originalPrice,
    rating: spec.prod1.rating,
    awardBadge: spec.prod1.awardBadge,
    affiliateUrl: deal1.affiliateUrl,
    buyRetailer: deal1.buyRetailer,
    image: spec.featuredImage,
    summary: spec.prod1.summary,
    keySpecs: spec.prod1.specs,
    pros: spec.prod1.pros,
    cons: spec.prod1.cons,
    isWinner: spec.prod1.isWinner,
    asin: spec.prod1.asin,
    commissionRate: comm1.ratePercent,
    estimatedCommissionUSD: comm1.estimatedCommissionUSD,
    exactMatchAmazon: deal1.isExactMatch,
    productDataStatus: (deal1.isExactMatch ? 'verified' : 'unverified') as 'verified' | 'unverified',
    amazonAdDeal: deal1
  };

  const p2 = {
    id: `${spec.id}-p2`,
    name: spec.prod2.name,
    brand: spec.prod2.brand,
    model: spec.prod2.model,
    price: spec.prod2.price,
    originalPrice: spec.prod2.originalPrice,
    rating: spec.prod2.rating,
    awardBadge: spec.prod2.awardBadge,
    affiliateUrl: deal2.affiliateUrl,
    buyRetailer: deal2.buyRetailer,
    image: spec.featuredImage,
    summary: spec.prod2.summary,
    keySpecs: spec.prod2.specs,
    pros: spec.prod2.pros,
    cons: spec.prod2.cons,
    isWinner: spec.prod2.isWinner,
    asin: spec.prod2.asin,
    commissionRate: comm2.ratePercent,
    estimatedCommissionUSD: comm2.estimatedCommissionUSD,
    exactMatchAmazon: deal2.isExactMatch,
    productDataStatus: (deal2.isExactMatch ? 'verified' : 'unverified') as 'verified' | 'unverified',
    amazonAdDeal: deal2
  };

  const rawPost: Partial<Post> = {
    id: spec.id,
    slug: spec.slug,
    title: spec.title,
    category: spec.category,
    categoryLabel: spec.categoryLabel,
    excerpt: spec.excerpt,
    readTimeMinutes: spec.readTimeMinutes,
    publishedAt: spec.publishedAt,
    updatedAt: spec.publishedAt,
    author: {
      name: 'Worthora Staff',
      role: 'Editorial Board & Testing Lab',
      avatar: '/worthora_logo.jpg'
    },
    featuredImage: spec.featuredImage,
    quickVerdict: spec.quickVerdict,
    products: [p1, p2],
    comparisonMatrix: spec.matrix,
    contentHtml,
    whoShouldBuy: spec.whoShouldBuy,
    whoShouldSkip: spec.whoShouldSkip,
    faq: spec.faq,
    tags: spec.tags,
    isAutonomous: false,
    modelUsed: 'Google Gemini 3.8 Flash + Worthora AdSense High-Value Intelligence',
    isFeatured: false,
    isTrending: false,
    viewCount: 0,
    status: 'draft'
  };

  return runIntelligentPluginsPipeline(rawPost);
}
