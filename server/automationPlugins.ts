import { Post, PluginAuditReport } from '../src/types';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

export class MarketGroundingPlugin {
  static pluginName = 'Evidence and Product Data Guard';
  static description = 'Checks that product and price claims have a source instead of inventing market data.';
  static process(post: Partial<Post>): void {
    post.products = (post.products || []).map(product => ({
      ...product,
      exactMatchAmazon: Boolean(product.asin && /^[A-Z0-9]{10}$/i.test(product.asin)),
      ...(product.amazonAdDeal ? {
        amazonAdDeal: {
          ...product.amazonAdDeal,
          badge: '', ratingStars: 0, reviewsCount: 0, primeEligible: false,
          savingsPercentage: 0, monetizationScore: 0, affiliateVolume: '',
          dataStatus: product.asin ? 'verified' : 'unverified'
        }
      } : {})
    }));
  }
}

export class EeatValidatorPlugin {
  static pluginName = 'Editorial Evidence and Experience Validator';
  static description = 'Reports supplied evidence; it never invents instruments, samples or test hours.';
  static generateLabNotes(): PluginAuditReport['eeatLabNotes'] {
    return {
      ambientConditions: 'Not supplied — no laboratory measurement was claimed as verified',
      testingHours: 0,
      instrumentsUsed: [],
      samplesTested: 0
    };
  }
}

export class AdSenseComplianceScanner {
  static pluginName = 'Reader Value and Monetization Quality Scanner';
  static description = 'Checks reader value, disclosure, structure, sources and internal navigation.';
  static audit(post: Partial<Post>) {
    const body = stripHtml(post.contentHtml || '');
    const count = wordCount(body);
    const checks: PluginAuditReport['adSenseChecks'] = [];
    let score = 100;
    if (count >= 900) checks.push({ name: 'Editorial depth', status: 'passed', details: `${count} palavras no corpo editorial.` });
    else { score -= 20; checks.push({ name: 'Editorial depth', status: 'warning', details: `A matéria tem ${count} palavras no corpo; aumente contexto, comparação e decisão de compra.` }); }
    const hasDisclosure = /affiliate|commission|reader-supported|publicidade|patrocinad/i.test(body);
    if (hasDisclosure) checks.push({ name: 'Commercial disclosure', status: 'passed', details: 'Há divulgação comercial detectável.' });
    else { score -= 15; checks.push({ name: 'Commercial disclosure', status: 'warning', details: 'Inclua disclosure próximo aos links comerciais.' }); }
    const links = (post.contentHtml || '').match(/<a\b[^>]*href=/gi)?.length || 0;
    if (links >= 2) checks.push({ name: 'Sources and internal navigation', status: 'passed', details: `${links} links editoriais detectados.` });
    else { score -= 15; checks.push({ name: 'Sources and internal navigation', status: 'warning', details: 'Inclua fontes primárias e links para próximos artigos.' }); }
    const hasFaq = (post.faq || []).length >= 3;
    if (hasFaq) checks.push({ name: 'Decision support', status: 'passed', details: 'FAQ e orientação de compra presentes.' });
    else { score -= 10; checks.push({ name: 'Decision support', status: 'warning', details: 'Inclua pelo menos três perguntas reais de compradores.' }); }
    const sentences = body.split(/[.!?]+/).filter(Boolean).length || 1;
    const flesch = Math.max(40, Math.min(85, Math.round(206.835 - 1.015 * (count / sentences) - 70)));
    return { score: Math.max(0, score), checks, readability: { fleschScore: flesch, readingLevel: flesch > 65 ? 'Clear' : 'Technical' }, wordCount: count };
  }
}

export class SeoSchemaOptimizerPlugin {
  static pluginName = 'Search Intent and Internal Linking Planner';
  static description = 'Creates useful search-intent terms without claiming ranking or Google approval.';
  static generateKeywords(title: string, category: string): string[] {
    const tokens = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
    return Array.from(new Set([`${category.replace('-', ' ')} comparison`, 'which should I buy', 'pros and cons', 'buyer guide', ...tokens.slice(0, 5)])).slice(0, 10);
  }
}

export function runIntelligentPluginsPipeline(post: Partial<Post>): Post {
  MarketGroundingPlugin.process(post);
  const audit = AdSenseComplianceScanner.audit(post);
  const pluginReport: PluginAuditReport = {
    adSenseScore: audit.score,
    adSenseChecks: audit.checks,
    eeatLabNotes: EeatValidatorPlugin.generateLabNotes(),
    seoTargetKeywords: SeoSchemaOptimizerPlugin.generateKeywords(post.title || '', post.category || ''),
    readabilityIndex: audit.readability,
    wordCount: audit.wordCount,
    pluginsExecuted: [MarketGroundingPlugin.pluginName, EeatValidatorPlugin.pluginName, AdSenseComplianceScanner.pluginName, SeoSchemaOptimizerPlugin.pluginName]
  };
  return { ...post, pluginReport } as Post;
}
