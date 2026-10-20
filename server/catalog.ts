import fs from 'fs';
import path from 'path';
import { Post } from '../src/types';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://worthora.blog').replace(/\/$/, '');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function isPublished(post: Post): boolean {
  return post.status === 'published' && post.editorialReviewStatus === 'reviewed';
}

export function normalizeCatalog(input: Post[]): Post[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const normalized: Post[] = [];

  for (const raw of input || []) {
    if (!raw || !raw.id || !raw.slug || !raw.title) continue;
    if (seenIds.has(raw.id) || seenSlugs.has(raw.slug)) continue;
    const post = {
      ...raw,
      status: raw.status || 'draft',
      tags: Array.from(new Set(raw.tags || [])).slice(0, 12),
      updatedAt: raw.updatedAt || raw.publishedAt || new Date(0).toISOString()
    } as Post;
    seenIds.add(post.id);
    seenSlugs.add(post.slug);
    normalized.push(post);
  }

  return normalized.sort((a, b) =>
    new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );
}

export function getPublishedPosts(posts: Post[]): Post[] {
  return normalizeCatalog(posts).filter(isPublished);
}

function publicPostDto(post: Post): Post {
  const { pluginReport, ...safePost } = post as Post & { pluginReport?: unknown };
  return safePost as Post;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' }[char] || char));
}

export function buildSitemap(posts: Post[]): string {
  const urls = [
    `<url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...getPublishedPosts(posts).map(post =>
      `<url><loc>${SITE_URL}/review/${encodeURIComponent(post.slug)}</loc><lastmod>${escapeXml(post.updatedAt || post.publishedAt)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    )
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;
}

export function buildRss(posts: Post[]): string {
  const items = getPublishedPosts(posts).slice(0, 50).map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/review/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/review/${encodeURIComponent(post.slug)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Worthora Reviews</title><link>${SITE_URL}</link><description>Evidence-led product comparisons and buyer guides.</description>${items}\n</channel></rss>\n`;
}

export function syncPublicCatalog(posts: Post[], settings?: Record<string, unknown>): void {
  ensureDir(PUBLIC_DATA_DIR);
  const published = getPublishedPosts(posts).map(publicPostDto);
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'posts.json'), JSON.stringify(published, null, 2) + '\n', 'utf8');
  if (settings) {
    const safeSettings = {
      adSense: settings.adSense,
      affiliates: settings.affiliates,
      autonomous: {
        enabled: Boolean((settings.autonomous as any)?.enabled),
        frequencyHours: (settings.autonomous as any)?.frequencyHours || 24,
        postsPerDay: (settings.autonomous as any)?.postsPerDay || 1,
        totalGenerated: (settings.autonomous as any)?.totalGenerated || 0,
        lastRunTime: (settings.autonomous as any)?.lastRunTime || null,
        nextScheduledRun: (settings.autonomous as any)?.nextScheduledRun || null
      }
    };
    fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'settings.json'), JSON.stringify(safeSettings, null, 2) + '\n', 'utf8');
  }
  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), buildSitemap(published), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'public', 'rss.xml'), buildRss(published), 'utf8');
}

export function readCanonicalPosts(): Post[] {
  const file = path.join(DATA_DIR, 'posts.json');
  if (!fs.existsSync(file)) return [];
  return normalizeCatalog(JSON.parse(fs.readFileSync(file, 'utf8')));
}
