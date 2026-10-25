/**
 * WORTHORA GOLDEN EDITORIAL BLUEPRINT - GOOGLE ADSENSE & E-E-A-T STANDARDS
 * 
 * Technical memory and editorial foundation for Worthora's intelligence engine
 * (Google Gemini 3.8 Flash and Autonomous 24/7 Affiliate Robot).
 * All generated posts must adhere strictly to these guidelines:
 * 
 * CORE GUIDELINES FOR GOOGLE ADSENSE & NORTH AMERICAN E-E-A-T MONETIZATION:
 * 1. MINIMUM LENGTH: 1,000+ words of deeply informative, technical, and analytical content.
 * 2. AUTHORITY & E-E-A-T: Analysis grounded in empirical bench protocols (e.g. 40 continuous hours
 *    of testing, decibel sound meters, FLIR infrared thermography, torque in-lbs/Nm, energy efficiency %).
 * 3. WIRECUTTER / RTINGS JOURNALISTIC STRUCTURE:
 *    - Punchy journalistic lead declaring overall champion and score margin.
 *    - Fast-reading executive bullet highlights with bold headers.
 *    - Worthora Lab 40-hour stress testing and calibration methodology.
 *    - In-depth Champion Breakdown (why it earned the crown, real tactile feel, thermal curves).
 *    - In-depth Contender Breakdown (strengths, legitimate quirks, edge cases).
 *    - Direct head-to-head confrontation across 4 decisive pillars.
 *    - Standardized Lab Bench Specification Sheet table.
 *    - Real-world everyday scenarios (daily commute, busy family rush, unheated workshop).
 *    - Longevity, build durability, and official US warranty protection.
 *    - 10-Second Decision Pause: Who Should Buy & Who Should Pass.
 *    - Editorial Verdict & Final Buying Advice.
 *    - Comprehensive FAQ with search snippet schema.
 *    - Transparent Amazon Associates & FTC disclosure.
 */

export interface EditorialRuleSet {
  minWordCount: number;
  sectionsRequired: string[];
  toneOfVoice: string;
  adSenseComplianceChecklist: string[];
}

export const WORTHORA_ADSENSE_EDITORIAL_STANDARD: EditorialRuleSet = {
  minWordCount: 1000,
  sectionsRequired: [
    'uol-lead',
    'uol-bullets-summary',
    'metodologia-bancada',
    'analise-campeao',
    'analise-desafiante',
    'confronto-direto-4-pilares',
    'uol-ficha-tecnica',
    'quem-deve-comprar-evitar',
    'perguntas-frequentes-faq',
    'aviso-afiliados-ftc'
  ],
  toneOfVoice: 'Journalistic, empirical, impartial, direct, and authoritative in American English',
  adSenseComplianceChecklist: [
    'Zero fluff, filler, or artificial repetition',
    'Absolute focus on real consumer utility, durability, and total cost of ownership',
    'Official editorial attribution: Worthora Editorial Staff / Lab Team',
    'Measurable technical metrics using US customary and metric units (°F/°C, lbs/oz, in-lbs, CFM, PSI)',
    'Authentic pros and cons for both evaluated products',
    'Transparent integration with official Amazon US Prime listings with tag omniverdict-20'
  ]
};

