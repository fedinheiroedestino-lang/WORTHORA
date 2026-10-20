export type CategorySlug = 
  | 'all'
  | 'electronics'
  | 'tools'
  | 'clothing'
  | 'home-decoration'
  | 'personal-care'
  | 'books'
  // Legacy aliases for backward compatibility:
  | 'power-tools'
  | 'smart-home'
  | 'kitchen-appliances'
  | 'home-utilities'
  | 'outdoor-gear';

export const BLOG_CATEGORIES: { slug: CategorySlug; label: string; legacySlugs?: string[] }[] = [
  { slug: 'all', label: 'All Reviews' },
  { slug: 'electronics', label: 'Electronics', legacySlugs: ['electronics'] },
  { slug: 'tools', label: 'Tools', legacySlugs: ['power-tools', 'home-utilities', 'outdoor-gear'] },
  { slug: 'clothing', label: 'Clothing', legacySlugs: ['clothing'] },
  { slug: 'home-decoration', label: 'Home and Decoration', legacySlugs: ['smart-home', 'kitchen-appliances'] },
  { slug: 'personal-care', label: 'Personal Care', legacySlugs: ['personal-care'] },
  { slug: 'books', label: 'Books', legacySlugs: ['books'] }
];

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface AmazonAdDealInfo {
  adTitle: string;
  asin: string;
  badge: string; // e.g. "Amazon's Choice", "#1 Mais Vendido", "Melhor Oferta Prime"
  ratingStars: number;
  reviewsCount: number;
  primeEligible: boolean;
  savingsPercentage: number;
  monetizationScore: number; // 0 to 100
  affiliateVolume: string; // e.g. "+15.000 compras verificadas no último mês"
  commissionRate: number;
  estimatedCommissionUSD: number;
  dealCtaText: string;
  affiliateUrl?: string;
  buyRetailer?: string;
  dataStatus?: 'verified' | 'unverified';
  lastCheckedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  rating: number; // 0 to 10
  awardBadge?: string; // e.g., "Best Overall Pick", "Best Budget Value", "Runner Up"
  affiliateUrl: string;
  buyRetailer: string; // e.g. "Amazon Global", "Amazon Brasil", "Mercado Livre"
  image: string;
  summary: string;
  keySpecs: Record<string, string>;
  pros: string[];
  cons: string[];
  isWinner?: boolean;
  asin?: string;
  commissionRate?: number; // Amazon category percentage rate, e.g. 4.5
  estimatedCommissionUSD?: number; // e.g. 11.25
  exactMatchAmazon?: boolean;
  amazonAdDeal?: AmazonAdDealInfo;
  productDataStatus?: 'verified' | 'unverified';
}

export interface ComparisonMatrixRow {
  feature: string;
  unit?: string;
  winnerIndex?: number; // 0, 1, 2 or -1
  values: string[];
}

export interface QuickVerdict {
  summary: string;
  overallScore: number; // 0 to 10
  verdictBadge: string; // e.g., "Editor's Absolute Choice"
  winnerProductName: string;
  subRatings: {
    category: string;
    score: number; // 0 to 10
  }[];
}

export interface PluginAuditReport {
  adSenseScore: number; // 0 to 100
  adSenseChecks: {
    name: string;
    status: 'passed' | 'warning';
    details: string;
  }[];
  eeatLabNotes: {
    ambientConditions: string;
    testingHours: number;
    instrumentsUsed: string[];
    samplesTested: number;
  };
  seoTargetKeywords: string[];
  readabilityIndex: {
    fleschScore: number;
    readingLevel: string;
  };
  wordCount: number;
  pluginsExecuted: string[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  categoryLabel: string;
  excerpt: string;
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  editorialReviewStatus?: 'needs-source-review' | 'reviewed';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featuredImage: string;
  quickVerdict: QuickVerdict;
  products: ProductItem[];
  comparisonMatrix: ComparisonMatrixRow[];
  contentHtml: string;
  whoShouldBuy: string[];
  whoShouldSkip: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  tags: string[];
  isAutonomous: boolean;
  modelUsed?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  viewCount?: number;
  status?: 'published' | 'draft';
  communityVotes?: Record<string, number>;
  pluginReport?: PluginAuditReport;
  evidence?: EvidenceRecord[];
  learning?: LearningSignals;
}

export interface EvidenceRecord {
  claim: string;
  url: string;
  title: string;
  accessedAt: string;
  sourceType: 'primary' | 'retailer' | 'secondary' | 'original-test';
}

export interface LearningSignals {
  impressions?: number;
  engagedSessions?: number;
  averageEngagementSeconds?: number;
  internalClickThroughRate?: number;
  affiliateClickThroughRate?: number;
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  lastAggregatedAt?: string;
  promptVersion?: string;
}

export interface AffiliateNetworkConfig {
  defaultNetwork: 'amazon' | 'mercadolivre' | 'shopee' | 'custom';
  amazonTag: string; // e.g. "worthora-20"
  amazonRegion: 'com' | 'com.br';
  mercadoLivreCode: string; // e.g. "MLB12345"
  shopeeAppId: string;
  customBaseUrl: string; // e.g. "https://www.example.com/search?q={query}&ref={tag}"
  autoDeepLinking: boolean; // Auto-generate search deep links with tracking tag for all products
  disclaimer: string;
}

export interface AdSenseConfig {
  enabled: boolean;
  publisherId: string; // e.g. ca-pub-1234567890123456
  autoAds: boolean;
  testMode: boolean; // Show stylized converting placeholder units when true
  slots: {
    topLeaderboard: string;
    inArticle: string;
    sidebarSkyscraper: string;
    inFeed: string;
    stickyFooter: string;
  };
  affiliateDisclaimer: string;
}

export interface AutonomousSchedulerStatus {
  enabled: boolean;
  frequencyHours: number; // 12 hours = 2x daily
  postsPerDay: number; // 2 posts per day
  yearlyTotalTarget: number; // 730 posts per year
  dailySlots: string[]; // e.g. ['09:00 AM (Morning Peak)', '06:00 PM (Evening Peak)']
  lastRunTime: string | null;
  nextScheduledRun: string | null;
  totalGenerated: number;
  currentEngine: string;
  recentLogs: {
    id: string;
    timestamp: string;
    title: string;
    status: 'success' | 'failed' | 'in_progress';
    summary: string;
  }[];
}

export interface AdminUser {
  email: string;
  displayName: string;
  role: 'owner' | 'editor';
  isAuthenticated: boolean;
}

export interface WorkerLog {
  id: string;
  timestamp: string;
  type: 'audit' | 'generation' | 'sync' | 'security';
  message: string;
  details?: string;
  status: 'success' | 'info' | 'warning';
}

export interface Worker247Status {
  isActive: boolean;
  uptimeSeconds: number;
  startedAt: string;
  lastAuditTimestamp: string | null;
  lastGenerationTimestamp: string | null;
  nextScheduledRun: string | null;
  frequencyHours: number;
  postsPerDay: number; // 2
  yearlyTarget: number; // 730
  dailySlots: string[];
  totalProductsMonitored: number;
  exactMatchesCount: number;
  complianceScorePercent: number;
  totalEstimatedCommissionPoolUSD: number;
  logs: WorkerLog[];
}
