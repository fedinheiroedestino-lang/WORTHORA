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
  return `=== WORTHORA US EDITORIAL & HUMANIZED REVIEW STANDARD (MANDATORY) ===
LANGUAGE: 100% NATIVE, IDIOMATIC AMERICAN ENGLISH.
TARGET AUDIENCE: North American consumers shopping on Amazon.com with Prime.
WORD COUNT: AT LEAST 1,000 WORDS (Target: 1,150 - 1,350 words). Never generate brief summaries or truncated sections.

YOU MUST EMBODY THE 5 HUMANIZED EDITORIAL PILLARS IN EVERY PARAGRAPH:
1. PILLAR 1 - SPECIALIST VOICE & ZERO AI CLICHES:
   - Write in an engaging first-person plural editorial voice ("we spent 40 hours bench testing", "what caught our eye upon unboxing").
   - Strictly BANNED AI clichés: Do NOT use "in today's fast-paced world", "delve into", "testament to", "it's crucial to remember", "a force to be reckoned with". Speak like an experienced, trusted gear tester having a candid conversation over coffee.
   - Describe tactile textures, weight in hand, tactile click of switches, and sensory ergonomics.

2. PILLAR 2 - STORYTELLING ARC ("BUYER DILEMMA, TORTURE TEST & BRUTAL HONESTY"):
   - Open with the genuine dilemma every US shopper faces: "Is paying an extra $150 actually worth it, or are you paying for a feature you'll never use?"
   - Describe our grueling test conditions: 40 continuous bench hours under heat lamps, vibration testing, and sustained load.
   - Brutal honesty about flaws: Point out the real quirks, short cables, glossy plastic that scratches easily, or proprietary chargers. Readers trust reviews that tell the hard truths.

3. PILLAR 3 - RELATABLE US EVERYDAY SCENARIOS:
   - Describe real North American life situations: the noisy morning commute on the subway or highway, a cross-country flight from JFK to LAX, a busy Monday morning kitchen routine, a crowded home office with kids in the next room, or weekend yard work in a humid suburban afternoon.

4. PILLAR 4 - VIVID VISUAL METAPHORS & US MEASUREMENTS:
   - Use US customary units alongside metric: Fahrenheit (°F), pounds (lbs), ounces (oz), inches, feet, ft-lbs of torque, CFM, and PSI.
   - Translate numbers into relatable metaphors: "battery life that easily survives a red-eye flight with juice left for your morning rideshare", "as lightweight as an apple in your backpack".

5. PILLAR 5 - MICRO-INTERACTIVITY & DECISION PAUSES:
   - Include a sharp decision pause: "Pause here for 10 seconds: Are you using this daily for work, or twice a month on weekends? If it's the latter, save yourself $100 and buy the runner-up."
   - Provide explicit "Who Should Buy" and "Who Should Pass" sections.

MANDATORY EDITORIAL SECTIONS (HTML tags):
- <p class="uol-lead">: High-impact journalistic opening announcing the champion, score margin, and why it won for US shoppers.
- <div class="uol-bullets-summary">: 3-4 bold bullet highlights.
- <h2>Worthora Lab 40-Hour Stress Test & Bench Protocol</h2>: Calibrated testing procedures with empirical numbers.
- <h2>In-Depth Champion Breakdown: Why It Earned the Crown</h2>: Deep dive into build, motor/chip performance, and everyday advantages (minimum 3 paragraphs).
- <h2>The Contender Breakdown: Real Strengths & Legitimate Quirks</h2>: Fair analysis of budget strengths and honest limitations (minimum 3 paragraphs).
- <h2>Head-to-Head Showdown Across 4 Decisive Pillars</h2>: Direct comparison across Performance, Build Quality, Ergonomics, and Amazon US Value.
- <h2>Real-World Everyday Scenarios: How They Fit Your Routine</h2>: Practical daily lifestyle tests.
- <div class="uol-ficha-tecnica">: Standardized bench spec grid.
- <h2>Who Should Buy & Who Should Pass</h2>: Actionable buyer recommendations.
- <h2>Frequently Asked Questions</h2>: Real answers to common buyer questions.
=== END OF LEARNED MODEL ===`;
}
