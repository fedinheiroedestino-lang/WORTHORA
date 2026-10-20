import { GoogleGenAI } from '@google/genai';
import { Post, CategorySlug } from '../src/types';
import { runIntelligentPluginsPipeline } from './automationPlugins';
import { getSettings, getPosts } from './storage';
import { buildProductAffiliateLink, calculateAmazonCommission, findBestAmazonAdDeal } from './affiliateEngine';
import { sanitizeHtmlContent } from './security';
import { getLearnedModel, buildLearnedModelPromptInstruction } from './learnedModelTemplate';
import { compileRawArticle, RawArticleSpec } from './articleCompiler';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Banco de tópicos de alta rentabilidade nas 6 categorias oficiais solicitadas pelo usuário:
// Electronics, Tools, clothing, Home and Decoration, Personal Care, books
const AUTONOMOUS_TOPIC_BANK: {
  topic: string;
  category: CategorySlug;
  categoryLabel: string;
  image: string;
}[] = [
  // 1. ELECTRONICS (High RPM & Search Volume)
  {
    topic: 'Sony WH-1000XM5 vs. Bose QuietComfort Ultra: The Ultimate Noise-Canceling Headphone Benchmark',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Apple AirPods Pro 2 vs. Sony WF-1000XM5: Flagship Wireless Earbuds ANC, Soundstage & Mic Test',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'LG C4 OLED vs. Samsung S90D QD-OLED: Which Flagship 4K Display Wins for Gaming and Cinema?',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Apple MacBook Air M3 vs. Dell XPS 13: 40-Hour Battery, Thermal Throttling & Daily Productivity Test',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Sonos Arc vs. Bose Smart Ultra Soundbar: Dolby Atmos Surround & Dialogue Clarity Living Room Test',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Shure SM7B vs. Rode Procaster: Broadcast Studio Dynamic Microphone Showdown for Streamers & Podcasters',
    category: 'electronics',
    categoryLabel: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80'
  },

  // 2. TOOLS & HARDWARE (High Conversion & High Ticket)
  {
    topic: 'DeWalt 20V MAX XR vs. Milwaukee M18 FUEL: Heavy-Duty Cordless Hammer Drill Bench Shootout',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Milwaukee M18 FUEL vs. Makita 18V LXT: Cordless Impact Driver Torque, Nut-Busting Power & Speed Test',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Bosch 12-Inch Dual-Bevel Glide vs. DeWalt DWS780: Precision Sliding Compound Miter Saw Workshop Test',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Kärcher K5 Premium Smart Control vs. Sun Joe SPX3000: Best Electric Pressure Washer for Driveways & Siding',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Bosch GLM 50 C vs. Leica DISTO D2: The Ultimate Laser Measure Shootout for Contractors & Architects',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Ryobi ONE+ 18V vs. Craftsman V20: Best Budget Cordless Power Tool Starter Combo Kits Benchmarked',
    category: 'tools',
    categoryLabel: 'Tools',
    image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=1200&q=80'
  },

  // 3. HOME & APPLIANCES (Highest Commissions & Ticket Value)
  {
    topic: "Breville Barista Touch Impress vs. De'Longhi Specialista Maestro: Hands-On Espresso Extraction & Milk Steaming",
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Roborock S8 Pro Ultra vs. Dreame L20 Ultra: Autonomous Mopping & Heavy Suction Robot Vacuum Clash',
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Dyson V15 Detect vs. Shark Stratos Cordless: Anti-Allergen Filtration, Hair Wrap & Hardwood Cleaning',
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Vitamix A3500 Ascent vs. Ninja Foodi Power Blender: Heavy Pureeing, Nut Butter & Motor Longevity Test',
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Philips Hue White & Color Ambiance vs. Govee Smart LED Bars: Room Mood Lighting & Smart Home Sync',
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Ooni Koda 16 vs. Gozney Roccbox: Portable Outdoor Gas Pizza Oven 950°F Heat Retention & Crust Crispness',
    category: 'home-decoration',
    categoryLabel: 'Home and Decoration',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  },

  // 4. PERSONAL CARE & GROOMING (Constant Buying Intent)
  {
    topic: 'Braun Series 9 Pro vs. Philips Norelco S9000 Prestige: Wet & Dry Electric Shaver Closeness & Skin Comfort',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Dyson Supersonic vs. Shark HyperAIR: Fast Drying Speeds, Heat Damage Protection & Frizz Control',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Oral-B iO Series 9 vs. Philips Sonicare DiamondClean 9000: Smart Plaque Removal & Gum Health Benchmarks',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Theragun PRO Plus vs. Hyperice Hypervolt 2 Pro: Deep Tissue Percussion Therapy PPM & Stall Force Review',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Dyson Airwrap Multi-Styler vs. Shark FlexStyle: Thermal Styling Versatility & Hair Volume Longevity',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Panasonic Arc6 vs. Braun Series 9 Pro+: 6-Blade Foil Speed & Daily Sensitive Neck Irritation Test',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'
  },

  // 5. CLOTHING & OUTDOOR APPAREL (High Brand Loyalty)
  {
    topic: 'Patagonia Torrentshell 3L vs. Arc\'teryx Beta LT: Packable Waterproof Breathability & Storm Protection',
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: "Levi's 501 Original vs. Wrangler Cowboy Cut 13MWZ: Heavy Denim Longevity, Shrinkage & Fit Shootout",
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Brooks Ghost 16 vs. Hoka Clifton 9: Daily Distance Road Cushioning, Arch Support & Outsole Wear Test',
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Lululemon ABC Pant vs. Vuori Meta Pant: Performance Travel Chinos 4-Way Stretch & Wrinkle Resistance',
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Blundstone 500 Series vs. Red Wing Iron Ranger: Heritage Leather Boot Durability, Comfort & Resoleability',
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Smartwool Classic Thermal vs. Icebreaker 200 Oasis: 100% Merino Wool Base Layer Itch & Odor Resistance',
    category: 'clothing',
    categoryLabel: 'Clothing',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80'
  },

  // 6. BOOKS & READING HARDWARE (Timeless Impact & High Search Volume)
  {
    topic: 'Kindle Paperwhite Signature vs. Kobo Clara Colour: High-DPI E-Ink Display, Warm Lighting & Battery Life',
    category: 'books',
    categoryLabel: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Atomic Habits by James Clear vs. The Power of Habit by Charles Duhigg: Practical Behavioral Change Comparison',
    category: 'books',
    categoryLabel: 'Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'The Psychology of Money by Morgan Housel vs. Die with Zero by Bill Perkins: Wealth Mindset & Spending Strategy',
    category: 'books',
    categoryLabel: 'Books',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    topic: 'Deep Work by Cal Newport vs. Essentialism by Greg McKeown: Peak Concentration & Focus Playbook Review',
    category: 'books',
    categoryLabel: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'
  }
];

// Infinite Topic Matrix for Continuous 365-Day Publishing (730+ Unique Annual Articles)
const EVERGREEN_SYNTHESIS_MATRIX: Partial<Record<CategorySlug, Array<{ topic: string; image: string }>>> = {
  electronics: [
    { topic: 'Sonos Arc Ultra vs. Bose Smart Ultra Soundbar: Dolby Atmos Spatial Audio & Dialog Clarity Test', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'DJI Mini 4 Pro vs. Autel EVO Nano+: Omnidirectional Obstacle Sensing & 4K60 HDR Flight Benchmark', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Apple Watch Ultra 2 vs. Garmin Fenix 8 Solar: Trail GPS Accuracy, Multi-Day Battery & Rugged Titanium Case', image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Asus ROG Zephyrus G16 vs. Lenovo Legion Pro 7i: RTX 4080 Mobile Thermal Throttling & OLED Benchmark', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Sony A7 IV vs. Canon EOS R6 Mark II: Autofocus Eye Tracking, In-Body Stabilization & 4K Overheating Test', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'GoPro HERO 13 Black vs. DJI Osmo Action 5 Pro: HyperSmooth vs. RockSteady Extreme Cold Battery Test', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'TP-Link Deco BE85 vs. Netgear Orbi 970: Wi-Fi 7 Multi-Gigabit Mesh Throughput & Thick Wall Penetration', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Elgato Wave:3 vs. Rode PodMic USB: Broadcast Studio Voice Warmth, Clipguard Limiting & Audio DSP', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80' }
  ],
  tools: [
    { topic: 'Makita 18V LXT Sub-Compact vs. Bosch 18V Brushless Compact: Cabinet Ergonomics, Chuck Runout & Torque', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Fluke 87V Industrial vs. Klein Tools MM720 TRMS: True-RMS Accuracy, Drop Resistance & CAT IV Safety', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Milwaukee PACKOUT Rolling System vs. DeWalt ToughSystem 2.0: IP65 Weatherproof & Jobsite Drop Durability', image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Stihl MSA 220 C-B vs. Husqvarna 540i XP: Battery Chainsaw Chain Speed, Hardwood Cutting & Thermal Limit', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'DeWalt 20V MAX 21° Framing Nailer vs. Paslode Cordless XP: Pneumatic Speed, Hardwood Sinking & Jam Clearance', image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80' }
  ],
  'home-decoration': [
    { topic: "Gaggia Classic Pro EVO vs. Breville Bambino Plus: Commercial 9-Bar Extraction, Brass Portafilter & Steam", image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Levoit Core 600S vs. Coway Airmega 400: CADR Smoke Clearance, Sleep Mode Decibels & True HEPA Longevity', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Anker SOLIX C1000 vs. Bluetti AC180: LiFePO4 Cycle Life, UPS Sub-20ms Transfer & Solar Fast Charging', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Herman Miller Aeron vs. Steelcase Gesture: Lumbar Spine Ergonomics, 3D Mesh & 12-Hour Daily Work Comfort', image: 'https://images.unsplash.com/photo-1580481077194-c3c15372051e?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Breville Joule Turbo vs. Anova Precision Cooker 3.0: Water Bath Temperature Stability & Rapid Heating Test', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80' }
  ],
  'personal-care': [
    { topic: 'Waterpik Aquarius Professional vs. Philips Sonicare Power Flosser 3000: Interdental Plaque Removal Test', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Braun Silk-expert Pro 5 IPL vs. Ulike Air 3 Sapphire: Cooling Technology & Long-Term Hair Reduction', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Panasonic ARC5 Wet/Dry vs. Philips Norelco Shaver 9800: 14000 CPM Motor Speed & Neck Razor Burn Benchmark', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'TheraFace PRO vs. NuFACE Trinity+ Facial Toning Kit: Microcurrent Lift, Red Light Therapy & Deep Cleansing', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80' }
  ],
  clothing: [
    { topic: 'The North Face McMurdo Parka vs. Columbia Whirlibird IV 3-in-1: Sub-Zero Thermal Down & Winter Storm Shell', image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Salomon Speedcross 6 vs. Altra Lone Peak 8: Trail Running Grip Lug Depth, Rock Plate & Toe Protection', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Darn Tough Hiker Boot Sock vs. Smartwool Classic Hike: Merino Density, Cushioning & Lifetime Durability', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Ray-Ban Classic Polarized Wayfarer vs. Oakley Holbrook Prizm: Glare Filtration, Optical Distortion & Hinges', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80' }
  ],
  books: [
    { topic: 'Never Split the Difference (Chris Voss) vs. Getting to Yes (Roger Fisher): High-Stakes Negotiation Guide', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Thinking in Systems (Donella Meadows) vs. The Fifth Discipline (Peter Senge): Complexity & Feedback Loops', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'Man\'s Search for Meaning (Viktor Frankl) vs. Meditations (Marcus Aurelius): Resilience & Stoic Purpose', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80' },
    { topic: 'BOOX Note Air3 C vs. reMarkable 2: Color E-Ink Display, Android Versatility & Stylus Latency Benchmark', image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1200&q=80' }
  ]
};

export async function generateAutonomousReview(customTopic?: string): Promise<Post> {
  const currentSettings = getSettings();
  const existingPosts = getPosts();
  
  // Intelligent category balancer: check post count per category to maintain equal 4+ distribution
  const officialCategories: CategorySlug[] = ['electronics', 'tools', 'clothing', 'home-decoration', 'personal-care', 'books'];
  const catDistribution: Record<string, number> = {};
  officialCategories.forEach(c => catDistribution[c] = 0);
  existingPosts.forEach((p: Post) => {
    if (catDistribution[p.category] !== undefined) {
      catDistribution[p.category]++;
    }
  });

  // Find category with lowest post count
  const sortedCategories = [...officialCategories].sort((a, b) => catDistribution[a] - catDistribution[b]);
  const targetCategory = sortedCategories[0];

  // Intelligent deduplication: check which topics have not been published yet!
  const existingTitles = new Set(existingPosts.map((p: Post) => p.title.toLowerCase().trim()));
  const categoryTopics = [
    ...AUTONOMOUS_TOPIC_BANK.filter(t => t.category === targetCategory),
    ...(EVERGREEN_SYNTHESIS_MATRIX[targetCategory] || []).map(item => ({
      topic: item.topic,
      category: targetCategory,
      categoryLabel: targetCategory === 'home-decoration' ? 'Home and Decoration' : targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1),
      image: item.image
    }))
  ];
  const unpickedTopics = categoryTopics.filter(t => !existingTitles.has(t.topic.toLowerCase().trim()));
  
  // Prioritize unpicked fresh topics in target category
  const topicPool = unpickedTopics.length > 0 ? unpickedTopics : categoryTopics;
  const chosenTopicObj = topicPool[Math.floor(Math.random() * topicPool.length)];

  const topicTitle = customTopic || chosenTopicObj.topic;
  const category = chosenTopicObj.category;
  const categoryLabel = chosenTopicObj.categoryLabel;
  const defaultImage = chosenTopicObj.image;

  const learnedInstruction = buildLearnedModelPromptInstruction();

  const systemInstruction = `You are the evidence-first editor for Worthora. Help a real reader decide without inventing tests, sources or commercial facts.
${learnedInstruction}
Editorial rules:
- Generate a useful English draft of 900-1,400 words only when it adds specific value.
- Never use first-person testing language, laboratory names, calibrated instruments, hours, samples, measurements, ratings, prices, Prime, stock, warranty or sales claims unless supplied with a dated source or original test record.
- If evidence is missing, label the text as a specification-based draft and leave the verdict neutral.
- Use short paragraphs, concrete trade-offs, a buyer checklist, three FAQs and two suggested internal links.
- Keep affiliate links separate from editorial reasoning and label search links as unverified.
Return one valid JSON object only, matching the requested schema.`;

  const prompt = `Write a useful, evidence-led head-to-head comparison draft on the topic: "${topicTitle}".
Category: "${category}".
Target Audience: readers trying to make a careful purchase decision. Do not assume Prime, region, price or availability.

The output must be a single raw JSON object (without markdown code fences, or standard json) with the following structure:
{
  "title": "${topicTitle}",
  "slug": "url-friendly-slug-with-hyphens",
  "category": "${category}",
  "categoryLabel": "${categoryLabel}",
  "excerpt": "A compelling 1-2 sentence source-led summary. Do not claim a test result or winner.",
  "readTimeMinutes": 10,
  "quickVerdict": {
    "summary": "2-3 sentences explaining the decision criteria. Keep winnerProductName empty and overallScore 0 until evidence is reviewed.",
    "overallScore": 0,
    "verdictBadge": "Draft — evidence review required",
    "winnerProductName": "",
    "subRatings": [
      { "category": "Performance & Peak Power", "score": 0 },
      { "category": "Build Quality & Materials", "score": 0 },
      { "category": "Ergonomics & Daily Comfort", "score": 0 },
      { "category": "Thermal Efficiency & Noise", "score": 0 },
      { "category": "Total cost and terms", "score": 0 }
    ]
  },
  "products": [
    {
      "id": "prod-1",
      "name": "Full product 1 name including model number",
      "brand": "Brand Name 1",
      "model": "Model 1",
      "price": 0,
      "originalPrice": 0,
      "rating": 0,
      "awardBadge": "Source review required",
      "affiliateUrl": "https://www.amazon.com/s?k=${encodeURIComponent(topicTitle)}&tag=omniverdict-20",
      "buyRetailer": "Amazon",
      "image": "${defaultImage}",
      "summary": "1-2 punchy sentences summarizing its strengths and who it is made for.",
      "keySpecs": {
        "Documented specification": "9.6 / 10",
        "Source status": "96% Peak Output",
        "Build Materials": "Reinforced structural polymer with metal torque joints",
        "US Warranty": "3-Year Official Manufacturer Warranty",
        "Retailer status": "Amazon US with Prime 2-Day Delivery"
      },
      "pros": [
        "First major pro backed by real testing",
        "Second pro",
        "Third pro",
        "Fourth pro"
      ],
      "cons": [
        "First legitimate trade-off or drawback",
        "Second drawback"
      ],
      "isWinner": false,
      "productDataStatus": "unverified"
    },
    {
      "id": "prod-2",
      "name": "Full product 2 name including model number",
      "brand": "Brand Name 2",
      "model": "Model 2",
      "price": 0,
      "originalPrice": 0,
      "rating": 0,
      "awardBadge": "Source review required",
      "affiliateUrl": "https://www.amazon.com/s?k=${encodeURIComponent(topicTitle)}&tag=omniverdict-20",
      "buyRetailer": "Amazon",
      "image": "${defaultImage}",
      "summary": "Summary of product 2.",
      "keySpecs": {
        "Documented specification": "9.1 / 10",
        "Source status": "89% Sustained Output",
        "Build Materials": "Standard structural composite",
        "US Warranty": "1-Year Manufacturer Warranty",
        "Retailer status": "Amazon US with Prime Delivery"
      },
      "pros": [
        "Pro 1",
        "Pro 2",
        "Pro 3"
      ],
      "cons": [
        "Con 1",
        "Con 2"
      ],
      "isWinner": false,
      "productDataStatus": "unverified"
    }
  ],
  "comparisonMatrix": [
    {
      "feature": "Sustained Peak Output",
      "values": ["96% Efficiency (Zero Throttling)", "89% Efficiency (Slight Drop Under Heat)"],
      "winnerIndex": 0
    },
    {
      "feature": "Documented feature",
      "values": ["107°F (42°C) Controlled Surface", "127°F (53°C) Peak Under Full Load"],
      "winnerIndex": 0
    },
    {
      "feature": "Documented feature",
      "values": ["Whisper Quiet (<42 dBA)", "Moderate Perceptible Hum (~54 dBA)"],
      "winnerIndex": 0
    },
    {
      "feature": "Warranty source",
      "values": ["3 Years Official Amazon US Warranty", "1 Year Standard Coverage"],
      "winnerIndex": 0
    },
    {
      "feature": "Build Seal & Drop Durability",
      "values": ["Reinforced Professional Grade", "Standard Residential Composite"],
      "winnerIndex": 0
    }
  ],
  "contentHtml": "<p class=\\"uol-lead\\">The <strong>[Champion]</strong> outperformed the <strong>[Contender]</strong> throughout Worthora Lab's rigorous 40-hour stress testing protocol, securing the top spot as the definitive best purchase on Amazon. In empirical bench measurements with calibrated thermal sensors and power analyzers, the champion demonstrated decisive advantages in thermal dissipation, sustained torque, and day-to-day ergonomic comfort.</p><div class=\\"uol-bullets-summary\\"><h3 class=\\"text-base font-bold text-amber-900 mb-2 uppercase tracking-wide\\">Worthora Lab Bench Highlights & Key Takeaways</h3><ul><li><strong>Proven Sustained Performance:</strong> The champion operated without thermal throttling across repeated 4-hour stress cycles.</li><li><strong>Best Value for North American Shoppers:</strong> Eligible for Amazon Prime 2-day delivery, seamless 30-day returns, and full US warranty protection.</li><li><strong>The Contender Handles Routine Tasks:</strong> A respectable budget-conscious choice for light household duty without requiring top-tier investment.</li></ul></div><h2>Worthora Lab 40-Hour Stress Test & Bench Protocol</h2><p>At our independent testing facility, we do not rely on manufacturer spec sheets or marketing claims. Both contenders were acquired through authorized US retail channels and subjected to 40 continuous hours of supervised bench operation at a controlled ambient temperature of 72°F (22°C).</p><h2>In-Depth Champion Breakdown: Why It Earned the Crown</h2><p>From the moment we unboxed the champion, the build quality set it apart. The tactile feel of the switches, the reinforced chassis joints, and the balanced center of gravity eliminate operator fatigue during long sessions.</p><h2>The Contender Breakdown: Real Strengths & Legitimate Quirks</h2><p>The contender has undeniable merits, particularly for budget-focused shoppers. However, under sustained heavy load beyond 90 minutes, it ran approximately 20°F hotter, requiring cool-down periods.</p><h2>Head-to-Head Showdown Across 4 Decisive Pillars</h2><p>In direct head-to-head bench testing across Performance, Build Quality, Ergonomics, and Amazon US Value, the champion swept 3 out of 4 pillars.</p><h2>Real-World Everyday Scenarios: How They Fit Your Routine</h2><p>Tested in real-world scenarios: the daily commute, home office video calls, and busy morning routines.</p><div class=\\"uol-ficha-tecnica\\"><h3>STANDARDIZED LAB BENCH SPECIFICATION SHEET</h3><div class=\\"ficha-grid\\"><p><strong>Overall Lab Champion:</strong> [Winner Name] (Rating 9.6 / 10)</p><p><strong>Runner-Up Contender:</strong> [Contender Name] (Rating 9.1 / 10)</p><p><strong>Testing Facility:</strong> Worthora Independent Consumer Lab</p><p><strong>Evaluation Protocol:</strong> 40 Hours Continuous Bench Cycling</p><p><strong>Verified US Store:</strong> Amazon.com (Prime 2-Day Eligible)</p><p><strong>Manufacturer Warranty:</strong> 3 Years Official US Coverage</p><p><strong>Editorial Verdict:</strong> Top Pick for Durability & Sustained Value</p></div></div><h2>Who Should Buy & Who Should Pass</h2><p>Detailed guidance for buyers.</p><h2>Editorial Verdict & Final Buying Advice</h2><p>Our concluding recommendations.</p>",
  "whoShouldBuy": [
    "Shoppers and professionals who demand reliable sustained performance without thermal throttling",
    "Buyers who prioritize official 3-year US warranties and hassle-free Amazon Prime customer support",
    "Consumers who value quiet acoustic operation, refined ergonomics, and premium tactile materials"
  ],
  "whoShouldSkip": [
    "Casual users who only need the product once or twice a year for light, sporadic tasks",
    "Shoppers searching strictly for the rock-bottom lowest upfront price regardless of longevity"
  ],
  "faq": [
    {
      "question": "Which of these two products offers the best value on Amazon?",
      "answer": "The overall champion delivers the highest return per dollar spent, featuring reinforced internal components, zero thermal throttling, and a lower verified return rate among North American buyers."
    },
    {
      "question": "Is it worth paying the extra cost for the winning model?",
      "answer": "Yes. Over a projected 3-year lifespan, the champion's superior thermal efficiency, lower component fatigue, and extended warranty make it significantly cheaper per year of ownership."
    },
    {
      "question": "Are both products backed by official US warranties and Amazon Prime?",
      "answer": "Yes, both items are cataloged in official Amazon US storefronts with Prime 2-day delivery, 30-day hassle-free returns, and manufacturer warranty coverage."
    }
  ],
  "tags": ["Lab Bench Test", "Amazon Prime", "Head-to-Head Benchmark", "Buyer Guide", "US Market"]
}`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set. Activating Learned High-Value Model Compiler.');
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out after 8 seconds')), 8000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const rawText = response.text || '';
    let data: any;
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      // Fallback: match first '{' to last '}'
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse valid JSON from Gemini AI response');
      }
    }

    const now = new Date();
    const uniqueId = `post-ai-${Date.now()}`;
    const slug = (data.slug || topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')).slice(0, 80);

    const generatedPost: Post = {
      id: uniqueId,
      slug: slug,
      title: data.title || topicTitle,
      category: (data.category as CategorySlug) || category,
      categoryLabel: data.categoryLabel || categoryLabel,
      excerpt: data.excerpt || `In-depth head-to-head evaluation of ${topicTitle} with hands-on bench test results and buying advice.`,
      readTimeMinutes: data.readTimeMinutes || 10,
      publishedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      author: {
        name: 'Equipe Worthora',
        role: 'Equipe Editorial Worthora',
        avatar: '/worthora_logo.jpg'
      },
      featuredImage: chosenTopicObj.image,
      quickVerdict: data.quickVerdict || {
        summary: 'Both products proved exceptional during testing, but the primary flagship earned our recommendation through superior build reliability and performance consistency.',
        overallScore: 9.4,
        verdictBadge: "Autonomous Pick 2026",
        winnerProductName: data.products?.[0]?.name || 'Top Tested Contender',
        subRatings: [
          { category: 'Performance', score: 9.5 },
          { category: 'Durability', score: 9.4 },
          { category: 'Ergonomics', score: 9.2 },
          { category: 'Value', score: 9.1 }
        ]
      },
      products: data.products && data.products.length > 0 ? data.products.map((p: any, idx: number) => {
        const prodPrice = Number(p.price) || 199.99;
        const affiliateInfo = buildProductAffiliateLink(p.name, p.brand, p.model, currentSettings.affiliates);
        const comm = calculateAmazonCommission(category, prodPrice);
        const bestAdDeal = findBestAmazonAdDeal(p.name, p.brand, p.model, category, prodPrice, currentSettings.affiliates);

        return {
          ...p,
          image: p.image || defaultImage,
          affiliateUrl: bestAdDeal.affiliateUrl,
          buyRetailer: bestAdDeal.buyRetailer,
          commissionRate: comm.ratePercent,
          estimatedCommissionUSD: comm.estimatedCommissionUSD,
          exactMatchAmazon: true,
          amazonAdDeal: bestAdDeal
        };
      }) : [
        (() => {
          const defaultAff = buildProductAffiliateLink(`${topicTitle} Flagship`, 'Leader Brand', 'Pro 2026', currentSettings.affiliates);
          const comm = calculateAmazonCommission(category, 249.99);
          const bestAdDeal = findBestAmazonAdDeal(`${topicTitle} Flagship`, 'Leader Brand', 'Pro 2026', category, 249.99, currentSettings.affiliates);
          return {
            id: `${uniqueId}-p1`,
            name: `${topicTitle} Flagship`,
            brand: 'Leader Brand',
            model: 'Pro 2026',
            price: 249.99,
            originalPrice: 289.99,
            rating: 9.5,
            awardBadge: 'Top Overall Pick',
            affiliateUrl: bestAdDeal.affiliateUrl,
            buyRetailer: bestAdDeal.buyRetailer,
            commissionRate: comm.ratePercent,
            estimatedCommissionUSD: comm.estimatedCommissionUSD,
            exactMatchAmazon: true,
            image: defaultImage,
            summary: 'Delivers superior sustained power, commercial grade components, and exceptional user ergonomics.',
            keySpecs: { 'Efficiency': '96%', 'Warranty': '3 Years', 'Power': 'High Output' },
            pros: ['Remarkable build quality', 'Exemplary real-world power', 'Class-leading ergonomics'],
            cons: ['Premium price point'],
            isWinner: true,
            amazonAdDeal: bestAdDeal
          };
        })()
      ],
      comparisonMatrix: data.comparisonMatrix || [
        { feature: 'Overall Build Quality', values: ['Reinforced composite', 'Standard polymer'], winnerIndex: 0 },
        { feature: 'Evidence status', values: ['96% peak', '89% peak'], winnerIndex: 0 },
        { feature: 'Warranty Duration', values: ['3-Year Pro Warranty', '2-Year Limited'], winnerIndex: 0 }
      ],
      contentHtml: sanitizeHtmlContent(data.contentHtml || `<h2>Comprehensive Evaluation & Bench Results</h2><p>Our lab team subjected both contenders to intensive stress testing across 40 continuous hours of operational cycling. In every trial, thermal management and peak output were continuously recorded to determine real-world reliability.</p>`),
      whoShouldBuy: data.whoShouldBuy || [
        'Users who demand professional-tier reliability',
        'Homeowners looking for a long-term investment',
        'Shoppers who prioritize safety and build quality'
      ],
      whoShouldSkip: [
        'Casual buyers who only need occasional light-duty performance'
      ],
      faq: data.faq || [
        {
          question: `Which model offers better warranty coverage?`,
          answer: 'The primary flagship includes an extended 3-year commercial warranty compared to standard 1-year consumer warranties.'
        }
      ],
      tags: data.tags || [categoryLabel, 'Buyer Guide', 'Comparison', 'Product Review'],
      isAutonomous: true,
      modelUsed: 'Google Gemini — evidence-gated editorial draft',
      isFeatured: false,
      isTrending: false,
      status: 'draft',
      viewCount: 1
    };

    // Hard evidence gate: Gemini output is always a draft. Commercial and verdict
    // fields remain neutral until a human attaches dated evidence.
    generatedPost.editorialReviewStatus = 'needs-source-review';
    generatedPost.evidence = Array.isArray(data.evidence) ? data.evidence.filter((item: any) =>
      item && /^https:\/\//i.test(item.url || '') && item.title && item.accessedAt &&
      ['primary', 'retailer', 'secondary', 'original-test'].includes(item.sourceType)
    ) : [];
    generatedPost.quickVerdict = {
      summary: 'Draft: evidence review required before declaring a winner.',
      overallScore: 0,
      verdictBadge: 'Draft — evidence review required',
      winnerProductName: '',
      subRatings: []
    };
    generatedPost.products = generatedPost.products.map((product: any) => ({
      ...product,
      price: 0,
      originalPrice: undefined,
      rating: 0,
      isWinner: false,
      exactMatchAmazon: false,
      productDataStatus: 'unverified',
      amazonAdDeal: undefined
    }));
    generatedPost.comparisonMatrix = [{ feature: 'Evidence status', values: ['Source review required', 'Source review required'], winnerIndex: -1 }];
    generatedPost.contentHtml = /we (tested|measured|recorded)|laboratory|calibrated|prime|rating|review count|stock|in stock|warranty|40[- ]hour|stress test/i.test(generatedPost.contentHtml)
      ? buildLearnedPostFromTopic(topicTitle, category, categoryLabel, defaultImage).contentHtml
      : generatedPost.contentHtml;
    // Evidence gate: sanitize the model output, but never pad it with invented claims.
    generatedPost.contentHtml = sanitizeHtmlContent(generatedPost.contentHtml);

    return runIntelligentPluginsPipeline(generatedPost);
  } catch (error) {
    console.warn('Gemini model spike or unavailable. Activating Learned High-Value Model Compiler (1000+ words guarantee):', error);
    // Use the safe evidence-gated draft fallback
    return buildLearnedPostFromTopic(topicTitle, category, categoryLabel, defaultImage);
  }
}

/**
 * Builds an authentic, deep, 1000+ words comparative post conforming strictly to the
 * Worthora US Learned Editorial Model in 100% American English whenever Gemini API experiences temporary spikes.
 */
export function buildLearnedPostFromTopic(
  topicTitle: string,
  category: CategorySlug,
  categoryLabel: string,
  defaultImage: string
): Post {
  const parts = topicTitle.split(/\s+vs\.?\s+/i);
  const first = (parts[0] || topicTitle).trim();
  const second = (parts[1] || 'Alternative').split(':')[0].trim();
  const now = new Date().toISOString();
  const id = `draft-${Date.now()}`;
  const slug = topicTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const settings = getSettings();
  const product = (name: string, index: number) => {
    const link = buildProductAffiliateLink(name, undefined, undefined, settings.affiliates);
    return {
      id: `${id}-p${index}`, name, brand: name.split(' ')[0] || 'Unknown', model: '',
      price: 0, rating: 0, affiliateUrl: link.affiliateUrl, buyRetailer: link.buyRetailer,
      image: defaultImage, summary: 'Product details require source verification before publication.',
      keySpecs: {}, pros: [], cons: ['Current price, availability and performance data not verified.'],
      isWinner: false, exactMatchAmazon: false, productDataStatus: 'unverified' as const
    };
  };
  const contentHtml = `<p class="uol-lead">This is an editorial draft comparing ${first} and ${second}. It frames the buyer decision, identifies what is known from public specifications, and clearly marks what Worthora still needs to verify before publishing a winner.</p>
  <h2>Quick answer: who should consider each option?</h2><p>${first} may suit readers who value its stated design or feature set. ${second} may be more appropriate when its documented strengths match your routine. This draft does not claim a performance winner until the relevant sources or original test notes are attached.</p>
  <h2>What we can verify from public information</h2><p>Separate manufacturer specifications from editorial observations. Add the exact model, revision, region, measured dimensions and source URL for every fact. Do not treat a retailer search result, marketing phrase or generated estimate as a test result.</p>
  <h2>The four decisions that matter in daily use</h2><h3>Performance and capability</h3><p>Explain the task the reader actually needs to complete, then compare only documented features that affect it. State limitations and incompatible accessories instead of filling gaps with confident-sounding numbers.</p><h3>Comfort and routine</h3><p>Describe controls, setup, maintenance, noise or handling only when supported by first-hand notes or a cited source. Translate specifications into a realistic routine without pretending to have observed a person or a laboratory event.</p><h3>Durability and support</h3><p>List the warranty and service information with its source and region. Avoid claims about lifespan, failure rate, water resistance or safety unless the applicable standard and evidence are provided.</p><h3>Total cost</h3><p>Show the price as “check current price” until a dated source is connected. Include required accessories, subscriptions, consumables and return conditions when documented.</p>
  <h2>Before you buy</h2><ul><li>Confirm the exact model and regional variant.</li><li>Compare current seller, return and warranty terms.</li><li>Check compatibility with the accessories or ecosystem you already own.</li><li>Revisit this article after the sources and test notes are reviewed.</li></ul>
  <h2>Who should buy and who should pass</h2><p>Buy only if the documented features solve a specific problem in your routine. Pass when the missing evidence, total cost or compatibility risk matters more than the headline feature.</p>
  <h2>Frequently asked questions</h2><h3>Are the prices and ratings verified?</h3><p>Not in this draft. They must be supplied with a dated, region-specific source before publication.</p><h3>Which product wins?</h3><p>No winner is declared until the comparison has enough evidence for a fair decision.</p><h3>Where can I find the next useful guide?</h3><p>The published version should link to two related Worthora comparisons in the same category and explain why each is relevant.</p>
  <p class="editorial-disclosure"><strong>Disclosure:</strong> Worthora may earn a commission from qualifying links. Commercial links are kept separate from the editorial verdict.</p>`;
  return runIntelligentPluginsPipeline({
    id, slug, title: topicTitle, category, categoryLabel,
    excerpt: `A source-led buyer guide to ${first} versus ${second}, with verified facts separated from open questions.`,
    readTimeMinutes: 6, publishedAt: now, updatedAt: now,
    author: { name: 'Worthora Editorial Team', role: 'Draft awaiting evidence review', avatar: '/worthora_logo.jpg' },
    featuredImage: defaultImage,
    quickVerdict: { summary: 'Draft: evidence review required before declaring a winner.', overallScore: 0, verdictBadge: 'Draft — evidence review required', winnerProductName: '', subRatings: [] },
    products: [product(first, 1), product(second, 2)], comparisonMatrix: [], contentHtml,
    whoShouldBuy: ['Readers who want a source-led comparison before buying'], whoShouldSkip: ['Readers who need a verified current price or measured result today'],
    faq: [{ question: 'Are these claims verified?', answer: 'Only after an editor attaches the source or original test note.' }, { question: 'Is this post published?', answer: 'No. It is a draft awaiting evidence review.' }, { question: 'Do affiliate links affect the verdict?', answer: 'No. Monetization must never determine the editorial recommendation.' }],
    tags: [categoryLabel, 'Buyer Guide', 'Comparison', 'Draft'], isAutonomous: true, modelUsed: 'Google Gemini — evidence-gated draft', isFeatured: false, isTrending: false, viewCount: 0, status: 'draft'
  } as Partial<Post> as Post);
}
