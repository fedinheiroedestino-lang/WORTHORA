import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Post, AdSenseConfig, AutonomousSchedulerStatus, AffiliateNetworkConfig } from '../src/types';
import { INITIAL_POSTS } from '../src/data/seedPosts';
import { runIntelligentPluginsPipeline } from './automationPlugins';
import { DEFAULT_AFFILIATE_CONFIG } from './affiliateEngine';
import { sanitizeHtmlContent } from './security';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  adSense: AdSenseConfig;
  autonomous: AutonomousSchedulerStatus;
  affiliates: AffiliateNetworkConfig;
  adminEmail: string; // Server-only, strictly never exposed publicly
  adminPasswordHash?: string;
  adminPasswordSalt?: string;
  lastSecurityAudit?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  adminEmail: 'fedinheiroedestino@gmail.com',
  affiliates: DEFAULT_AFFILIATE_CONFIG,
  adSense: {
    enabled: true,
    publisherId: 'ca-pub-1323802134955418',
    autoAds: true,
    testMode: false,
    slots: {
      topLeaderboard: '7482910384',
      inArticle: '9384721092',
      sidebarSkyscraper: '8172635409',
      inFeed: '6253410982',
      stickyFooter: '5192837461'
    },
    affiliateDisclaimer: 'Worthora is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. As an Amazon Associate, we earn from qualifying purchases.'
  },
  autonomous: {
    enabled: true,
    frequencyHours: 12,
    postsPerDay: 2,
    yearlyTotalTarget: 730,
    dailySlots: ['09:00 AM (Morning Peak)', '06:00 PM (Evening Peak)'],
    lastRunTime: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    nextScheduledRun: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    totalGenerated: 0,
    currentEngine: 'Google Gemini 3.8 Flash (2x/Day US Production & Amazon US Top Deal Engine)',
    recentLogs: [
      {
        id: 'log-init',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        title: 'Autonomous System Initialized (2x/Day Production)',
        status: 'success',
        summary: 'Daily autonomous scheduler active (2 posts per day, 730 posts/year). Google AdSense E-E-A-T and Amazon high-yield engine active.'
      }
    ]
  }
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Atomic file writer: Writes to a unique temp file first, then atomically renames it.
 * This guarantees that posts.json and settings.json are NEVER left corrupted, truncated,
 * or partially written during unexpected crashes or rapid concurrent updates.
 */
function safeWriteJsonAtomic(targetFilePath: string, data: any): void {
  ensureDataDirectory();
  const tempFilePath = `${targetFilePath}.tmp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempFilePath, serialized, 'utf-8');
    fs.renameSync(tempFilePath, targetFilePath);
  } catch (err) {
    if (fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (_) {}
    }
    console.error(`Failed atomic write to ${targetFilePath}:`, err);
    throw err;
  }
}

export function getPosts(): Post[] {
  ensureDataDirectory();
  if (!fs.existsSync(POSTS_FILE)) {
    const enrichedSeed = INITIAL_POSTS.map(p => {
      const sanitized = {
        ...p,
        contentHtml: sanitizeHtmlContent(p.contentHtml)
      };
      return runIntelligentPluginsPipeline(sanitized);
    });
    savePosts(enrichedSeed);
    return enrichedSeed;
  }
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    let posts: Post[] = JSON.parse(raw);
    let modified = false;
    posts = posts.map(p => {
      // Ensure all stored posts have sanitized HTML
      const sanitizedHtml = sanitizeHtmlContent(p.contentHtml);
      if (sanitizedHtml !== p.contentHtml) {
        p.contentHtml = sanitizedHtml;
        modified = true;
      }
      if (!p.pluginReport) {
        modified = true;
        return runIntelligentPluginsPipeline(p);
      }
      return p;
    });
    if (modified) {
      savePosts(posts);
    }
    return posts;
  } catch (err) {
    console.error('Error reading posts.json, resetting to seed posts:', err);
    const enrichedSeed = INITIAL_POSTS.map(p => runIntelligentPluginsPipeline(p));
    savePosts(enrichedSeed);
    return enrichedSeed;
  }
}

export function savePosts(posts: Post[]): void {
  // Sanitize contentHtml across all posts before writing to disk
  const cleanedPosts = posts.map(p => ({
    ...p,
    contentHtml: sanitizeHtmlContent(p.contentHtml)
  }));
  safeWriteJsonAtomic(POSTS_FILE, cleanedPosts);
}

export function getSettings(): AppSettings {
  ensureDataDirectory();
  if (!fs.existsSync(SETTINGS_FILE)) {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      adSense: { ...DEFAULT_SETTINGS.adSense, ...(parsed.adSense || {}) },
      autonomous: { ...DEFAULT_SETTINGS.autonomous, ...(parsed.autonomous || {}) },
      affiliates: { ...DEFAULT_SETTINGS.affiliates, ...(parsed.affiliates || {}) }
    };
  } catch (err) {
    console.error('Error reading settings.json:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  safeWriteJsonAtomic(SETTINGS_FILE, settings);
}

export function addPost(newPost: Post): Post {
  const sanitizedPost: Post = {
    ...newPost,
    isFeatured: true,
    contentHtml: sanitizeHtmlContent(newPost.contentHtml)
  };
  const posts = getPosts();
  // Demote previous posts from being isFeatured so the new one stays in highlight
  const updatedPrevious = posts.map(p => ({ ...p, isFeatured: false }));
  const updated = [sanitizedPost, ...updatedPrevious];
  savePosts(updated);
  return sanitizedPost;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.contentHtml) {
    sanitizedUpdates.contentHtml = sanitizeHtmlContent(sanitizedUpdates.contentHtml);
  }

  posts[idx] = {
    ...posts[idx],
    ...sanitizedUpdates,
    updatedAt: new Date().toISOString()
  };
  savePosts(posts);
  return posts[idx];
}

export function deletePost(id: string): boolean {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}
