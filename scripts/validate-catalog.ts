import fs from 'fs';
import path from 'path';

const root = process.cwd();
const canonical = JSON.parse(fs.readFileSync(path.join(root, 'data', 'posts.json'), 'utf8'));
const publicPosts = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'posts.json'), 'utf8'));
if (!Array.isArray(canonical) || canonical.length === 0) throw new Error('Canonical catalog is empty');
if (!Array.isArray(publicPosts)) throw new Error('Public catalog is not an array');

const ids = new Set<string>();
const slugs = new Set<string>();
const allowedSourceTypes = new Set(['primary', 'retailer', 'secondary', 'original-test']);
const unsafeHtml = /<\s*(script|iframe|object|embed|style)\b|\son\w+\s*=|javascript:/i;
const directClaims = /We subjected|we deployed|we recorded|we measured|40 continuous hours|40-hour stress|Prime 2-day|verified Amazon|calibrated FLIR|independent testing facility/i;

for (const post of canonical) {
  if (ids.has(post.id) || slugs.has(post.slug)) throw new Error(`Duplicate post id or slug: ${post.id}/${post.slug}`);
  ids.add(post.id); slugs.add(post.slug);
  if (!['published', 'draft'].includes(post.status)) throw new Error(`Invalid status: ${post.slug}`);
  if (!['needs-source-review', 'reviewed'].includes(post.editorialReviewStatus)) throw new Error(`Missing editorial review status: ${post.slug}`);
  if (unsafeHtml.test(post.contentHtml || '')) throw new Error(`Unsafe HTML: ${post.slug}`);
  if (post.status === 'published') {
    if (post.editorialReviewStatus !== 'reviewed') throw new Error(`Published post requires editorial review: ${post.slug}`);
    if (!Array.isArray(post.evidence) || post.evidence.length === 0) throw new Error(`Published post requires evidence: ${post.slug}`);
    for (const evidence of post.evidence) {
      if (!/^https:\/\//i.test(evidence.url) || !evidence.title || !evidence.accessedAt || !allowedSourceTypes.has(evidence.sourceType)) {
        throw new Error(`Invalid evidence record: ${post.slug}`);
      }
    }
    if (directClaims.test((post.contentHtml || '').replace(/<[^>]+>/g, ' '))) throw new Error(`Unsupported claim remains: ${post.slug}`);
  }
  for (const product of post.products || []) {
    const hasAsin = typeof product.asin === 'string' && /^[A-Z0-9]{10}$/i.test(product.asin);
    if (product.exactMatchAmazon === true && !hasAsin) throw new Error(`Exact affiliate match without ASIN: ${post.slug}/${product.name}`);
    if (product.amazonAdDeal?.primeEligible === true || (product.amazonAdDeal?.reviewsCount || 0) > 0) throw new Error(`Unverified retail metrics remain: ${post.slug}/${product.name}`);
    if (product.productDataStatus === 'verified' && !hasAsin) throw new Error(`Verified product without ASIN: ${post.slug}/${product.name}`);
  }
}

const expectedPublic = canonical.filter((p: any) => p.status === 'published' && p.editorialReviewStatus === 'reviewed').map((p: any) => p.slug).sort();
const actualPublic = publicPosts.map((p: any) => p.slug).sort();
if (JSON.stringify(expectedPublic) !== JSON.stringify(actualPublic)) throw new Error('public/data/posts.json is not synchronized with the reviewed public catalog');
if (publicPosts.some((p: any) => p.status !== 'published' || p.editorialReviewStatus !== 'reviewed')) throw new Error('Unreviewed or draft post leaked into public/data/posts.json');
console.log(`Catalog valid: ${canonical.length} canonical posts, ${publicPosts.length} reviewed public posts.`);
