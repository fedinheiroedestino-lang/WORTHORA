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
}

export interface GroundedSource {
  id: string;
  url: string;
  title: string;
  domain: string;
  queriedAt: string; // ISO string of consultation
  supportedClaims: string[]; // Specific facts/claims this source sustains
  reliability: 'primary_manufacturer' | 'verified_retailer' | 'technical_benchmark' | 'editorial_review' | 'general_web';
  pautaId?: string;
  authorOrOrg?: string;
}

export interface GroundingMetadata {
  queriedAt: string;
  searchQueries: string[];
  sourcesCount: number;
  claimsCount: number;
  editorialReviewStatus: 'pending' | 'verified' | 'reviewed';
  notes?: string;
}

export interface RelatedArticleLink {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  categoryLabel?: string;
  excerpt?: string;
  featuredImage?: string;
  readTimeMinutes?: number;
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
  buyRetailer: string; // e.g. "Amazon Global", "Amazon Brasil"
  image: string;
  summary: string;
  keySpecs: Record<string, string>;
  pros: string[];
  cons: string[];
  isWinner?: boolean;
  asin?: string;
  commissionRate?: number;
  estimatedCommissionUSD?: number;
  exactMatchAmazon?: boolean;
  amazonAdDeal?: AmazonAdDealInfo;
  // Rigorous Verification & Anti-Hallucination flags:
  verificationStatus?: 'verified' | 'unverified';
  hasValidAsin?: boolean;
  priceStatus?: 'verified_current' | 'check_current_price';
  specSources?: string[];
  editorialObservations?: string[];
  unverifiedNotes?: string[];
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
  // Enhanced Grounded Editorial & Verification Fields
  sources?: GroundedSource[];
  groundingMetadata?: GroundingMetadata;
  buyerChecklist?: string[];
  relatedArticles?: RelatedArticleLink[];
  editorialObservations?: string[];
  unverifiedDisclaimers?: string[];
}

// ==========================================
// EDITORIAL QUEUE / KNOWLEDGE SPREADSHEET TYPES
// ==========================================

export type PautaStatus = 'nova' | 'pesquisando' | 'rascunho' | 'revisão' | 'aprovada' | 'publicada' | 'rejeitada';
export type PautaRisco = 'baixo' | 'medio' | 'alto';
export type TipoConteudo = 'comparativo_profundo' | 'guia_compras' | 'analise_longo_prazo' | 'checklist_tecnico';

export interface PautaItem {
  id: string;
  tema: string;
  categoria: CategorySlug;
  tipoConteudo: TipoConteudo;
  status: PautaStatus;
  risco: PautaRisco;
  fontes: number; // quantidade de fontes
  responsavelRevisao: string;
  dataPrevista: string;
  dataCriacao: string;
  resumoFactual?: string;
  slugSugerido?: string;
  produtosAlvo?: string[];
}

export interface FonteItem {
  id: string;
  url: string;
  titulo: string;
  dominio: string;
  dataConsulta: string;
  afirmacoesSustentadas: string[];
  confiabilidade: 'alta_fabricante' | 'alta_editorial' | 'media_varejo' | 'geral';
  usadoEmPautaId: string;
  categoria: CategorySlug;
}

export interface RevisaoItem {
  id: string;
  pautaId: string;
  tema: string;
  afirmacoesVerificadas: number;
  alertasFatos: string[];
  checagemEditorial: {
    fontesConfirmadas: boolean;
    semAlegacoesFalsasDeLaboratorio: boolean;
    semReviewsInventados: boolean;
    precosVerificadosOuMarcados: boolean;
    linksInternosValidados: boolean;
  };
  statusRevisao: 'pendente' | 'aprovado' | 'reprovado' | 'ressalvas';
  dataRevisao: string;
  parecer: string;
  revisor: string;
}

export interface PublicadoItem {
  id: string;
  pautaId: string;
  slug: string;
  titulo: string;
  categoria: CategorySlug;
  dataPublicacao: string;
  fontesQtd: number;
  metricasGA4: {
    leiturasCompletas: number;
    leiturasParciais50: number;
    tempoMedioSegundos: number;
    cliquesFontesCitadas: number;
    inscricoesNewsletter: number;
    compartilhamentos: number;
    cliquesAfiliado: number;
  };
  metricasGSC: {
    impressoes: number;
    cliques: number;
    ctr: number;
    posicaoMedia: number;
  };
  indiceValor: number; // 0 to 100 Score de Valor vs Volume
}

export interface EditorialQueueState {
  pautas: PautaItem[];
  fontes: FonteItem[];
  revisao: RevisaoItem[];
  publicado: PublicadoItem[];
  ultimaAtualizacao: string;
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

