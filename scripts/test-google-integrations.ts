import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const root = process.cwd();
dotenv.config({ path: path.join(root, '.env.production') });
const warnings: string[] = [];
const errors: string[] = [];
const ga4 = (process.env.VITE_GA4_MEASUREMENT_ID || '').trim();
const verification = (process.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();
const verifiedDns = (process.env.VITE_SEARCH_CONSOLE_VERIFIED_DNS || '').toLowerCase() === 'true';
const adsense = (process.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-1323802134955418').trim();

if (ga4 && !/^G-[A-Z0-9]+$/i.test(ga4)) errors.push('VITE_GA4_MEASUREMENT_ID must look like G-XXXXXXXXXX');
if (!ga4) warnings.push('GA4 not activated: provide the Measurement ID from the web data stream.');
if (!verification && !verifiedDns) warnings.push('Search Console verification mode is not configured.');
if (!/^ca-pub-[0-9]{10,20}$/.test(adsense)) errors.push('VITE_ADSENSE_PUBLISHER_ID must look like ca-pub-1234567890.');

const posts = JSON.parse(fs.readFileSync(path.join(root, 'data', 'posts.json'), 'utf8'));
const directUnverifiedClaims = /We subjected|we deployed|we recorded|we measured|40 continuous hours|40-hour stress|Prime 2-day|verified Amazon|calibrated FLIR|independent testing facility/i;
const claimPosts = posts.filter((post: any) => directUnverifiedClaims.test((post.contentHtml || '').replace(/<[^>]+>/g, ' ')));
if (claimPosts.length) errors.push(`${claimPosts.length} posts still contain direct unverified laboratory/retailer claims.`);
for (const post of posts) {
  if (post.editorialReviewStatus !== 'needs-source-review') errors.push(`Missing review status: ${post.slug}`);
  if (post.quickVerdict?.overallScore !== 0) errors.push(`Legacy score not neutralized: ${post.slug}`);
  if ((post.pluginReport?.eeatLabNotes?.testingHours || 0) !== 0) errors.push(`Legacy lab hours not neutralized: ${post.slug}`);
}
const app = fs.readFileSync(path.join(root, 'src', 'components', 'GoogleIntegrations.tsx'), 'utf8');
if (!app.includes('VITE_GA4_MEASUREMENT_ID') || !app.includes('VITE_GOOGLE_SITE_VERIFICATION')) errors.push('GoogleIntegrations.tsx is missing environment-based configuration.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Google integration test passed. AdSense=${adsense}; GA4=${ga4 || 'missing ID'}; Search Console=${verification ? 'HTML token present' : verifiedDns ? 'DNS verified' : 'verification mode missing'}.`);
if (warnings.length) console.warn(warnings.join('\n'));
