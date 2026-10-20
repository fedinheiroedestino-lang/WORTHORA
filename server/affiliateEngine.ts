import { AffiliateNetworkConfig, CategorySlug } from '../src/types';

export const DEFAULT_AFFILIATE_CONFIG: AffiliateNetworkConfig = {
  defaultNetwork: 'amazon',
  amazonTag: 'worthora-20',
  amazonRegion: 'com',
  mercadoLivreCode: '',
  shopeeAppId: '',
  customBaseUrl: '',
  autoDeepLinking: true,
  disclaimer: 'Worthora is reader-supported. As an Amazon Associate, we earn from qualifying purchases. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.'
};

export const AMAZON_COMMISSION_RATES: Record<string, { label: string; ratePercent: number; avgTicketUSD: number; description: string }> = {
  electronics: { label: 'Electronics & Audio', ratePercent: 3.5, avgTicketUSD: 380, description: 'Electronics and audio products' },
  tools: { label: 'Tools & Home Improvement', ratePercent: 3.5, avgTicketUSD: 220, description: 'Tools and workshop equipment' },
  clothing: { label: 'Apparel & Clothing', ratePercent: 4, avgTicketUSD: 85, description: 'Apparel and footwear' },
  'home-decoration': { label: 'Home & Decoration', ratePercent: 4.5, avgTicketUSD: 165, description: 'Home products and appliances' },
  'personal-care': { label: 'Personal Care', ratePercent: 4.5, avgTicketUSD: 95, description: 'Personal care products' },
  books: { label: 'Books & Kindles', ratePercent: 4.5, avgTicketUSD: 35, description: 'Books and reading devices' },
  'general-default': { label: 'General Catalog', ratePercent: 4, avgTicketUSD: 150, description: 'General catalog' }
};

export interface BestAmazonAdDeal {
  adTitle: string;
  asin: string;
  badge: string;
  ratingStars: number;
  reviewsCount: number;
  primeEligible: boolean;
  savingsPercentage: number;
  monetizationScore: number;
  affiliateVolume: string;
  commissionRate: number;
  estimatedCommissionUSD: number;
  dealCtaText: string;
  affiliateUrl: string;
  buyRetailer: string;
  isExactMatch: boolean;
  dataStatus: 'verified' | 'unverified';
  lastCheckedAt?: string;
}

function cleanAsin(asin?: string): string | undefined {
  return asin && /^[A-Z0-9]{10}$/i.test(asin.trim()) ? asin.trim().toUpperCase() : undefined;
}

export function calculateAmazonCommission(category: CategorySlug | string, price: number) {
  const matched = AMAZON_COMMISSION_RATES[category] || AMAZON_COMMISSION_RATES['general-default'];
  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  return {
    ratePercent: matched.ratePercent,
    estimatedCommissionUSD: safePrice ? Number((safePrice * matched.ratePercent / 100).toFixed(2)) : 0,
    categoryLabel: matched.label
  };
}

export function buildProductAffiliateLink(productName: string, brand?: string, model?: string, config: AffiliateNetworkConfig = DEFAULT_AFFILIATE_CONFIG, asin?: string) {
  const cfg = { ...DEFAULT_AFFILIATE_CONFIG, ...config };
  const exactAsin = cleanAsin(asin);
  const terms = [brand, productName, model].filter(Boolean).join(' ').trim();
  const query = encodeURIComponent(terms || productName || 'product');

  if (cfg.defaultNetwork === 'amazon') {
    const domain = cfg.amazonRegion === 'com.br' ? 'amazon.com.br' : 'amazon.com';
    const tag = encodeURIComponent(cfg.amazonTag || DEFAULT_AFFILIATE_CONFIG.amazonTag);
    const url = exactAsin
      ? `https://www.${domain}/dp/${exactAsin}?tag=${tag}`
      : `https://www.${domain}/s?k=${query}&tag=${tag}`;
    return { affiliateUrl: url, buyRetailer: domain === 'amazon.com.br' ? 'Amazon Brasil' : 'Amazon US', isExactMatch: Boolean(exactAsin), dataStatus: exactAsin ? 'verified' as const : 'unverified' as const };
  }
  if (cfg.defaultNetwork === 'mercadolivre') {
    return { affiliateUrl: `https://lista.mercadolivre.com.br/${query}`, buyRetailer: 'Mercado Livre', isExactMatch: false, dataStatus: 'unverified' as const };
  }
  if (cfg.defaultNetwork === 'shopee') {
    return { affiliateUrl: `https://shopee.com.br/search?keyword=${query}`, buyRetailer: 'Shopee', isExactMatch: false, dataStatus: 'unverified' as const };
  }
  if (cfg.customBaseUrl?.includes('{query}')) {
    return { affiliateUrl: cfg.customBaseUrl.replace('{query}', query).replace('{tag}', encodeURIComponent(cfg.amazonTag || '')), buyRetailer: 'Partner retailer', isExactMatch: false, dataStatus: 'unverified' as const };
  }
  return { affiliateUrl: `https://www.google.com/search?q=${query}`, buyRetailer: 'Search', isExactMatch: false, dataStatus: 'unverified' as const };
}

export function findBestAmazonAdDeal(productName: string, brand?: string, model?: string, category: CategorySlug | string = 'general-default', price = 0, config?: AffiliateNetworkConfig, customAsin?: string): BestAmazonAdDeal {
  const link = buildProductAffiliateLink(productName, brand, model, config, customAsin);
  const commission = calculateAmazonCommission(category, price);
  const exactAsin = cleanAsin(customAsin);
  return {
    adTitle: `${brand ? `${brand} ` : ''}${productName}${model ? ` (${model})` : ''}`,
    asin: exactAsin || '',
    badge: '',
    ratingStars: 0,
    reviewsCount: 0,
    primeEligible: false,
    savingsPercentage: 0,
    monetizationScore: 0,
    affiliateVolume: '',
    commissionRate: commission.ratePercent,
    estimatedCommissionUSD: commission.estimatedCommissionUSD,
    dealCtaText: exactAsin ? 'Check current price' : 'Search current offers',
    affiliateUrl: link.affiliateUrl,
    buyRetailer: link.buyRetailer,
    isExactMatch: link.isExactMatch,
    dataStatus: link.dataStatus,
    lastCheckedAt: new Date().toISOString()
  };
}

export function validateAmazonAffiliateSecurity(tag: string) {
  const cleanTag = (tag || '').trim();
  const isValidTag = /^[a-zA-Z0-9_-]{3,64}$/.test(cleanTag);
  return { isValidTag, isCompliant: isValidTag, warnings: isValidTag ? [] : ['Configure uma tag de associado válida antes de publicar links.'] };
}
