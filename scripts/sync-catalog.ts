import fs from 'fs';
import path from 'path';
import { normalizeCatalog, syncPublicCatalog } from '../server/catalog';
import { getSettings } from '../server/storage';

const root = process.cwd();
const dataFile = path.join(root, 'data', 'posts.json');
const posts = normalizeCatalog(JSON.parse(fs.readFileSync(dataFile, 'utf8')));

if (!posts.length) throw new Error('Refusing to publish an empty catalog');
const ids = new Set(posts.map(p => p.id));
const slugs = new Set(posts.map(p => p.slug));
if (ids.size !== posts.length || slugs.size !== posts.length) {
  throw new Error('Refusing to publish duplicate post ids or slugs');
}

fs.writeFileSync(dataFile, JSON.stringify(posts, null, 2) + '\n', 'utf8');
syncPublicCatalog(posts, getSettings() as unknown as Record<string, unknown>);
const seed = `import { Post } from '../types';\n\n// Generated from data/posts.json. Do not edit manually; run npm run sync:catalog.\nexport const CATEGORIES = [\n  { slug: 'all', name: 'All Reviews', description: 'All published comparisons and buyer guides.' },\n  { slug: 'electronics', name: 'Electronics', description: 'Evidence-led comparisons for personal electronics and audio.' },\n  { slug: 'tools', name: 'Tools', description: 'Workshop tools, hardware and practical buying guides.' },\n  { slug: 'clothing', name: 'Clothing', description: 'Apparel, footwear and outdoor gear comparisons.' },\n  { slug: 'home-decoration', name: 'Home and Decoration', description: 'Home products, appliances and practical upgrades.' },\n  { slug: 'personal-care', name: 'Personal Care', description: 'Personal care products with transparent trade-offs.' },\n  { slug: 'books', name: 'Books', description: 'Book and reading-device comparisons for curious buyers.' }\n] as const;\n\nexport const INITIAL_POSTS: Post[] = ${JSON.stringify(posts, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'src', 'data', 'seedPosts.ts'), seed, 'utf8');
console.log(`Catalog synchronized: ${posts.length} canonical posts, ${posts.filter(p => p.status !== 'draft').length} public posts.`);
