import fs from 'fs';
import path from 'path';
import { CategorySlug } from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LEARNED_MODEL_FILE = path.join(DATA_DIR, 'learned_model.json');

export interface LearnedModelSpec {
  modelName: string;
  version: string;
  learnedAt: string;
  adSenseComplianceScore: number;
  wordCountStandard: {
    minimum: number;
    target: number;
    enforcement: 'strict_1000_words';
  };
  categoriesQuota: {
    category: CategorySlug;
    label: string;
    requiredArticles: number;
    activeArticles: number;
  }[];
  journalisticStructure: {
    framework: string;
    sections: {
      id: string;
      title: string;
      tagOrClass: string;
      requiredContent: string;
    }[];
  };
  eeatTestingProtocol: {
    hoursOfBenchTesting: string;
    mandatoryMetrics: string[];
    instrumentationRequired: boolean;
  };
  monetizationAndCompliance: {
    network: string;
    defaultTag: string;
    ftcDisclosureText: string;
    prohibitedWordsFiltered: boolean;
    brandSafetyVerified: boolean;
  };
}

export const DEFAULT_LEARNED_ADSENSE_MODEL: LearnedModelSpec = {
  modelName: 'Worthora US High-Value Editorial Model (Wirecutter & RTINGS Benchmark Standard)',
  version: '3.0.0-us-market-humanized',
  learnedAt: new Date().toISOString(),
  adSenseComplianceScore: 100,
  wordCountStandard: {
    minimum: 1000,
    target: 1200,
    enforcement: 'strict_1000_words'
  },
  categoriesQuota: [
    { category: 'electronics', label: 'Electronics & Audio', requiredArticles: 4, activeArticles: 4 },
    { category: 'tools', label: 'Tools & Workshop', requiredArticles: 4, activeArticles: 4 },
    { category: 'clothing', label: 'Apparel & Performance Wear', requiredArticles: 4, activeArticles: 4 },
    { category: 'home-decoration', label: 'Home, Kitchen & Living', requiredArticles: 4, activeArticles: 4 },
    { category: 'personal-care', label: 'Personal Care & Grooming', requiredArticles: 4, activeArticles: 4 },
    { category: 'books', label: 'Books, Productivity & E-Readers', requiredArticles: 4, activeArticles: 4 }
  ],
  journalisticStructure: {
    framework: 'Wirecutter / RTINGS / The Verge US Editorial Standard',
    sections: [
      {
        id: 'uol_lead',
        title: 'Punchy Journalistic Lead Paragraph',
        tagOrClass: '<p class="uol-lead">',
        requiredContent: 'Announces the head-to-head bench test winner, score margin, and why it won for US buyers.'
      },
      {
        id: 'uol_bullets',
        title: 'Executive Lab Takeaways in Bullets',
        tagOrClass: '<div class="uol-bullets-summary">',
        requiredContent: '3 to 4 fast-reading bullet highlights with bold headers summarizing key lab findings.'
      },
      {
        id: 'methodology',
        title: 'Worthora Lab 40-Hour Stress Test & Bench Protocol',
        tagOrClass: '<h2>Worthora Lab 40-Hour Stress Test & Bench Protocol</h2>',
        requiredContent: 'Empirical description of 40+ bench hours, calibrated instruments, dual US imperial/metric units.'
      },
      {
        id: 'winner_analysis',
        title: 'In-Depth Champion Breakdown: Why It Earned the Crown',
        tagOrClass: '<h2>In-Depth Champion Breakdown: Why It Earned the Crown</h2>',
        requiredContent: 'Tactile details, component build, sustained peak performance, real-world ergonomics.'
      },
      {
        id: 'runner_up_analysis',
        title: 'The Contender Breakdown: Real Strengths & Legitimate Quirks',
        tagOrClass: '<h2>The Contender Breakdown: Real Strengths & Legitimate Quirks</h2>',
        requiredContent: 'Fair budget review, unvarnished honesty about drawbacks and edge cases.'
      },
      {
        id: 'direct_shootout',
        title: 'Head-to-Head Showdown Across 4 Decisive Pillars',
        tagOrClass: '<h2>Head-to-Head Showdown Across 4 Decisive Pillars</h2>',
        requiredContent: 'Performance, Durability, Ergonomics & Comfort, and Amazon US Value with Prime.'
      },
      {
        id: 'us_scenarios',
        title: 'Real-World US Everyday Scenarios',
        tagOrClass: '<h2>Real-World Everyday Scenarios: How They Fit Your Routine</h2>',
        requiredContent: 'Commute, cross-country flights, suburban yard, home workshop, morning rush.'
      },
      {
        id: 'uol_ficha',
        title: 'Standardized Lab Bench Specification Sheet',
        tagOrClass: '<div class="uol-ficha-tecnica">',
        requiredContent: 'Authoritative comparison grid detailing Winner, Contender, Lab Protocol, Amazon Store & Warranty.'
      },
      {
        id: 'buyer_verdict',
        title: 'Who Should Buy & Who Should Pass',
        tagOrClass: '<h2>Who Should Buy & Who Should Pass</h2>',
        requiredContent: 'Actionable decision pause, clear guidance on who should pull the trigger vs skip.'
      }
    ]
  },
  eeatTestingProtocol: {
    hoursOfBenchTesting: '40 to 60 hours under continuous stress',
    mandatoryMetrics: ['Thermal Dissipation (°F / °C)', 'Acoustic Sound Level (dBA)', 'Energy Efficiency (Watts)', 'Mechanical Torque / Stress Cycle Fatigue'],
    instrumentationRequired: true
  },
  monetizationAndCompliance: {
    network: 'Amazon Associates US',
    defaultTag: 'omniverdict-20',
    ftcDisclosureText: 'Worthora is reader-supported. As an Amazon Associate, we earn from qualifying purchases. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.',
    prohibitedWordsFiltered: true,
    brandSafetyVerified: true
  }
};

export function getLearnedModel(): LearnedModelSpec {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LEARNED_MODEL_FILE)) {
      const data = fs.readFileSync(LEARNED_MODEL_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading learned model, using default standard:', err);
  }
  saveLearnedModel(DEFAULT_LEARNED_ADSENSE_MODEL);
  return DEFAULT_LEARNED_ADSENSE_MODEL;
}

export function saveLearnedModel(spec: LearnedModelSpec): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEARNED_MODEL_FILE, JSON.stringify(spec, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving learned model:', err);
  }
}

/**
 * Builds the comprehensive prompt instruction injected into Gemini and worker generators
 * to guarantee that all future autonomous articles follow the American English standard with the 5 humanized pillars.
 */
export function buildLearnedModelPromptInstruction(): string {
  return `=== WORTHORA READER-FIRST EDITORIAL STANDARD ===
LANGUAGE: Clear, natural English for the audience defined by the topic.
PURPOSE: Help a real reader decide, compare alternatives and continue to a useful next article. Never write for a keyword quota.
QUALITY GATE: Produce a complete draft of 900-1,400 body words with a specific point of view, concrete trade-offs, a short decision summary, pros/cons, a comparison table, three real FAQs, and two relevant internal-link suggestions.

EVIDENCE RULES (MANDATORY):
- Use only facts supplied in the brief or clearly attributed public manufacturer/specification sources.
- Never invent laboratory work, instruments, hours, samples, prices, discounts, ratings, review counts, Prime, stock, warranties, user surveys or sales volume.
- If Worthora did not supply raw test data, call the piece a specification-based comparison and say what remains unverified.
- Do not invent an ASIN. A product link without an ASIN is a search link and must be labeled as such.
- Health, safety and finance topics require a cautious disclaimer and must not make clinical, safety or investment promises.

RETENTION STRUCTURE:
1. Open with the buyer dilemma and answer it in one paragraph.
2. Add a scannable “quick answer” with who should choose each option.
3. Explain the decision through four concrete criteria, including a meaningful drawback for each product.
4. Include a “before you buy” checklist, three FAQs and a next-read recommendation.
5. Use descriptive H2/H3 headings, short paragraphs, bullets and plain language. Avoid repetitive boilerplate and AI clichés.

MONETIZATION:
- Keep affiliate calls to action visually separate from editorial reasoning.
- Use the exact disclosure provided by the application near commercial links.
- Never make a commission or conversion target influence the winner; revenue is a measurement for the operator, not an editorial criterion.

OUTPUT: Return valid JSON only. Set status to "draft". Include an evidence array with source URL/title/date for every externally verifiable claim.=== END OF STANDARD ===`;
}
