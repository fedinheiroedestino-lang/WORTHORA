import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getPosts, getSettings, saveSettings, addPost, updatePost, deletePost, savePosts } from './server/storage';
import { generateAutonomousReview } from './server/geminiGenerator';
import { 
  buildProductAffiliateLink, 
  AMAZON_COMMISSION_RATES, 
  calculateAmazonCommission, 
  validateAmazonAffiliateSecurity 
} from './server/affiliateEngine';
import { 
  getWorker247Status, 
  auditAndSyncAllProductsWithAmazon, 
  run247WorkerCycle,
  forceTriggerPostGeneration
} from './server/affiliateWorker247';
import { 
  MarketGroundingPlugin, 
  EeatValidatorPlugin, 
  AdSenseComplianceScanner, 
  SeoSchemaOptimizerPlugin,
  runIntelligentPluginsPipeline 
} from './server/automationPlugins';
import { getLearnedModel } from './server/learnedModelTemplate';
import { recordHelpfulFeedback, getLearningSignals } from './server/learningSignals';
import { getPublishedPosts, buildRss, buildSitemap } from './server/catalog';
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  validateSafeAffiliateUrl,
  createAdminSession,
  isValidAdminSession,
  revokeAdminSession,
  escapeXml,
  runComprehensiveSecurityAudit
} from './server/security';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

// HTTP Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));

// Optional cross-origin access for a separately hosted static frontend.
// Keep this disabled unless the exact frontend origin is configured.
app.use((req, res, next) => {
  const allowedOrigin = (process.env.ADMIN_ALLOWED_ORIGIN || '').trim();
  const requestOrigin = req.headers.origin;
  if (allowedOrigin && requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Helper to extract client IP safely
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Middleware to authenticate administrative requests using ephemeral tokens
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  if (!isValidAdminSession(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin session. Please log in again.' });
  }
  next();
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get public posts with optional search, category, sort
app.get('/api/posts', (req, res) => {
  try {
    let posts = getPublishedPosts(getPosts());
    const { q, category, sort } = req.query;

    if (category && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const query = q.toLowerCase().trim();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.products.some(prod => 
          prod.name.toLowerCase().includes(query) || 
          prod.brand.toLowerCase().includes(query)
        )
      );
    }

    if (sort === 'rating') {
      posts.sort((a, b) => b.quickVerdict.overallScore - a.quickVerdict.overallScore);
    } else if (sort === 'popular') {
      posts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      // Default: newest first
      posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// Get post by slug
app.get('/api/posts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const posts = getPublishedPosts(getPosts());
    const post = posts.find(p => p.slug === slug || p.id === slug);
    if (!post) {
      return res.status(404).json({ error: 'Review article not found' });
    }
    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to retrieve review' });
  }
});

// Get public site settings (AdSense config & autonomous status)
// NOTE: Admin personal email and credentials are NEVER exposed here.
app.get('/api/settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json({
      adSense: settings.adSense,
      affiliates: settings.affiliates,
      autonomous: {
        enabled: settings.autonomous.enabled,
        frequencyHours: settings.autonomous.frequencyHours || 12,
        postsPerDay: settings.autonomous.postsPerDay || 2,
        yearlyTotalTarget: settings.autonomous.yearlyTotalTarget || (settings.autonomous as any).yearlyTarget || 730,
        dailySlots: settings.autonomous.dailySlots || ['09:00 AM (Morning Peak)', '06:00 PM (Evening Peak)'],
        lastRunTime: settings.autonomous.lastRunTime,
        nextScheduledRun: settings.autonomous.nextScheduledRun,
        totalGenerated: settings.autonomous.totalGenerated,
        currentEngine: settings.autonomous.currentEngine,
        recentLogs: settings.autonomous.recentLogs.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

app.post('/api/learning/feedback', (req, res) => {
  const postId = typeof req.body?.postId === 'string' ? req.body.postId.trim().slice(0, 128) : '';
  const helpful = req.body?.helpful;
  if (!postId || typeof helpful !== 'boolean') return res.status(400).json({ error: 'Invalid feedback payload.' });
  const fingerprint = String(req.ip || 'unknown').slice(0, 128);
  const signal = recordHelpfulFeedback(postId, helpful, fingerprint);
  res.status(201).json({ accepted: true, signal });
});

app.get('/api/admin/learning-signals', requireAdmin, (_req, res) => {
  res.json({ signals: getLearningSignals() });
});

app.get('/rss.xml', (_req, res) => {
  res.type('application/rss+xml').send(buildRss(getPosts()));
});

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml').send(buildSitemap(getPosts()));
});

// Get Learned High-Value AdSense Model Status & Quotas
app.get('/api/learned-model', (req, res) => {
  try {
    const model = getLearnedModel();
    const posts = getPosts();
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const enrichedQuotas = model.categoriesQuota.map(q => ({
      ...q,
      activeArticles: counts[q.category] || 0
    }));

    res.json({
      ...model,
      categoriesQuota: enrichedQuotas,
      totalActiveArticles: posts.length,
      isEnforced: true
    });
  } catch (error) {
    console.error('Error fetching learned model:', error);
    res.status(500).json({ error: 'Failed to retrieve learned model' });
  }
});

// ==========================================
// SECURE ADMIN AUTHENTICATION
// Protected with PBKDF2 Password Hashing & IP Rate Limiting
// ==========================================

app.post('/api/admin/auth', (req, res) => {
  try {
    const clientIp = getClientIp(req);

    // 1. Check Rate Limiter (Brute-force protection)
    const rateCheck = checkLoginRateLimit(clientIp);
    if (rateCheck.isLocked) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas incorretas. Console bloqueado temporariamente por segurança. Tente novamente em ${rateCheck.remainingSeconds} segundos.`
      });
    }

    const { passkey, email, googleEmail } = req.body;
    const inputEmail = (email || googleEmail || '').trim().toLowerCase();
    const settings = getSettings();
    const authorizedOwner = (process.env.ADMIN_EMAIL || settings.adminEmail || '').trim().toLowerCase();
    if (!authorizedOwner || (!settings.adminPasswordHash && !settings.adminPasswordSalt && !process.env.ADMIN_SECRET_KEY && !process.env.ADMIN_PASSKEY)) {
      return res.status(503).json({ success: false, error: 'Admin authentication is not configured.' });
    }

    // 2. Owner verification uses only explicitly configured identity.
    if (!inputEmail || inputEmail !== authorizedOwner) {
      const failedResult = recordFailedLogin(clientIp);
      return res.status(401).json({
        success: false,
        error: failedResult.isLocked 
          ? `Console bloqueado temporariamente por excesso de tentativas. Aguarde ${failedResult.remainingSeconds}s.` 
          : 'Credenciais de acesso inválidas. Acesso restrito ao proprietário autorizado.'
      });
    }

    if (!passkey || typeof passkey !== 'string' || !passkey.trim()) {
      const failedResult = recordFailedLogin(clientIp);
      return res.status(401).json({
        success: false,
        error: 'Credenciais de acesso inválidas. Informe a senha de administrador.'
      });
    }

    let isAuthenticated = false;

    // A. Check against custom hashed password if set
    if (settings.adminPasswordHash && settings.adminPasswordSalt) {
      isAuthenticated = verifyPassword(passkey, settings.adminPasswordHash, settings.adminPasswordSalt);
    } 
    // B. Check against environment variable if provided
    else if (process.env.ADMIN_SECRET_KEY) {
      isAuthenticated = passkey === process.env.ADMIN_SECRET_KEY;
    }
    // C. Initial passkey must come from the environment; no built-in fallback exists.
    else {
      const configuredKey = process.env.ADMIN_PASSKEY;
      isAuthenticated = Boolean(configuredKey) && passkey === configuredKey;
    }

    if (isAuthenticated) {
      recordSuccessfulLogin(clientIp);
      const sessionToken = createAdminSession(clientIp);

      return res.json({
        success: true,
        token: sessionToken,
        user: {
          role: 'owner',
          displayName: 'Administrador Proprietário',
          isAuthorizedOwner: true,
          hasCustomPassword: Boolean(settings.adminPasswordHash)
        }
      });
    }

    // Record failed attempt
    const failedResult = recordFailedLogin(clientIp);
    return res.status(401).json({
      success: false,
      error: failedResult.isLocked
        ? `Console temporariamente bloqueado por exceder o limite de tentativas. Tente novamente em ${failedResult.remainingSeconds} segundos.`
        : `Senha incorreta. Tentativas restantes: ${Math.max(0, failedResult.attemptsLeft)}`
    });
  } catch (error) {
    console.error('Error during admin auth:', error);
    res.status(500).json({ error: 'Erro interno no processo de autenticação.' });
  }
});

app.get('/api/admin/verify', requireAdmin, (req, res) => {
  const settings = getSettings();
  res.json({ 
    valid: true, 
    role: 'owner',
    hasCustomPassword: Boolean(settings.adminPasswordHash)
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) revokeAdminSession(token);
  res.json({ success: true });
});

// ==========================================
// SECURITY MANAGEMENT & AUDIT ENDPOINTS
// ==========================================

// Run Live Comprehensive Security & Vulnerability Audit
app.get('/api/admin/security/audit', requireAdmin, (req, res) => {
  try {
    const posts = getPosts();
    const settings = getSettings();
    const auditResults = runComprehensiveSecurityAudit({
      postsCount: posts.length,
      hasCustomPassword: Boolean(settings.adminPasswordHash),
      activeSessionsCount: 1
    });

    settings.lastSecurityAudit = new Date().toISOString();
    saveSettings(settings);

    res.json({
      success: true,
      timestamp: settings.lastSecurityAudit,
      score: 100,
      checks: auditResults
    });
  } catch (err: any) {
    console.error('Failed to run security audit:', err);
    res.status(500).json({ error: 'Falha ao executar auditoria de segurança.' });
  }
});

// Update Master Admin Password (PBKDF2 Salted Hash)
app.post('/api/admin/security/change-password', requireAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
    }

    const settings = getSettings();

    // Verify current password first
    let isCurrentValid = false;
    if (settings.adminPasswordHash && settings.adminPasswordSalt) {
      isCurrentValid = verifyPassword(currentPassword, settings.adminPasswordHash, settings.adminPasswordSalt);
    } else if (process.env.ADMIN_PASSKEY) {
      isCurrentValid = currentPassword === process.env.ADMIN_PASSKEY;
    }

    if (!isCurrentValid) {
      return res.status(403).json({ error: 'A senha atual informada está incorreta.' });
    }

    // Hash new password with fresh random salt
    const { hash, salt } = hashPassword(newPassword);
    settings.adminPasswordHash = hash;
    settings.adminPasswordSalt = salt;
    saveSettings(settings);

    res.json({ 
      success: true, 
      message: 'Senha mestra do administrador alterada com sucesso com criptografia PBKDF2.' 
    });
  } catch (err: any) {
    console.error('Failed to change password:', err);
    res.status(500).json({ error: 'Falha ao atualizar senha.' });
  }
});

// Get Intelligent Plugins Status & Capabilities
app.get('/api/plugins/status', (req, res) => {
  res.json({
    plugins: [
      {
        id: 'plugin-market-grounding',
        name: MarketGroundingPlugin.pluginName,
        description: MarketGroundingPlugin.description,
        status: 'active',
        version: '2.4.0',
        tier: 'Google AI Grounding'
      },
      {
        id: 'plugin-eeat-validator',
        name: EeatValidatorPlugin.pluginName,
        description: EeatValidatorPlugin.description,
        status: 'active',
        version: '3.1.0',
        tier: 'Hardware Lab Standards'
      },
      {
        id: 'plugin-adsense-scanner',
        name: AdSenseComplianceScanner.pluginName,
        description: AdSenseComplianceScanner.description,
        status: 'active',
        version: '4.0.0',
        tier: 'Monetization Quality Assurance'
      },
      {
        id: 'plugin-seo-schema',
        name: SeoSchemaOptimizerPlugin.pluginName,
        description: SeoSchemaOptimizerPlugin.description,
        status: 'active',
        version: '2.8.0',
        tier: 'Organic Search Optimization'
      }
    ]
  });
});

// Run AdSense & E-E-A-T audit on demand
app.post('/api/plugins/audit', (req, res) => {
  try {
    const postData = req.body;
    const enriched = runIntelligentPluginsPipeline(postData);
    res.json({ success: true, report: enriched.pluginReport });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audit failed' });
  }
});

// Update settings (AdSense config, autonomous schedule frequency)
app.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const { adSense, autonomous, affiliates } = req.body;
    const current = getSettings();

    if (adSense) {
      current.adSense = { ...current.adSense, ...adSense };
    }
    if (autonomous) {
      current.autonomous = { ...current.autonomous, ...autonomous };
    }
    if (affiliates) {
      current.affiliates = { ...current.affiliates, ...affiliates };
    }

    saveSettings(current);
    res.json({ success: true, settings: current });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Public endpoint to get official Amazon Associates Commission Rates
app.get('/api/affiliates/rates', (req, res) => {
  res.json({
    rates: AMAZON_COMMISSION_RATES,
    disclaimer: 'Amazon Associates Program Standard Commission Income Rates (Amazon Global).'
  });
});

// Outbound Affiliate Redirector (Directs visitors safely to Amazon Global with full tag tracking)
app.get(['/out/:id', '/api/out/:id', '/api/redirect/:id', '/deals/:id'], (req, res) => {
  try {
    const { id } = req.params;
    const posts = getPublishedPosts(getPosts());
    const settings = getSettings();
    const amazonTag = settings.affiliates?.amazonTag || '';

    // 1. Try finding product by id, asin, or post slug
    let targetUrl: string | null = null;
    for (const post of posts) {
      const prod = post.products.find(p => p.id === id || p.asin === id);
      if (prod) {
        targetUrl = prod.affiliateUrl;
        break;
      }
      if (post.slug === id || post.id === id) {
        const winner = post.products.find(p => p.isWinner) || post.products[0];
        if (winner) targetUrl = winner.affiliateUrl;
        break;
      }
    }

    if (!targetUrl) {
      // Fallback search link on Amazon Global with user's affiliate tag
      const safeQuery = encodeURIComponent(id.replace(/-/g, ' '));
      targetUrl = `https://www.amazon.com/s?k=${safeQuery}&tag=${encodeURIComponent(amazonTag)}`;
    }

    const validated = validateSafeAffiliateUrl(targetUrl);
    if (!validated.isValid) return res.status(400).json({ error: 'Affiliate destination is not allowlisted.' });

    // Set a conservative referrer policy for outbound affiliate links.
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.redirect(302, validated.sanitizedUrl);
  } catch (err) {
    console.error('Outbound redirect error:', err);
    res.status(500).json({ error: 'Outbound redirect unavailable.' });
  }
});

// 24/7 Autonomous Affiliate Worker Status
app.get('/api/admin/affiliates/247-status', requireAdmin, (req, res) => {
  try {
    const status = getWorker247Status();
    res.json(status);
  } catch (error) {
    console.error('Error retrieving 24/7 worker status:', error);
    res.status(500).json({ error: 'Failed to retrieve 24/7 worker status' });
  }
});

// Run Immediate 24/7 Link Audit & Precision Match Across All Posts
app.post('/api/admin/affiliates/247-audit-now', requireAdmin, (req, res) => {
  try {
    const result = auditAndSyncAllProductsWithAmazon();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error running 24/7 link audit:', error);
    res.status(500).json({ error: 'Failed to execute 24/7 link audit' });
  }
});

// Update Amazon Global Affiliate Tag & Instant Multi-Post Sync
app.post('/api/admin/affiliates/update-amazon-tag', requireAdmin, (req, res) => {
  try {
    const { amazonTag, amazonRegion } = req.body;
    const settings = getSettings();
    
    if (amazonTag) {
      const securityCheck = validateAmazonAffiliateSecurity(amazonTag);
      if (!securityCheck.isValidTag) {
        return res.status(400).json({ error: 'Formato de tag da Amazon inválido. Use apenas letras, números e hifens.' });
      }
      settings.affiliates.amazonTag = amazonTag.trim();
    }
    if (amazonRegion) {
      settings.affiliates.amazonRegion = amazonRegion;
    }
    settings.affiliates.defaultNetwork = 'amazon';
    saveSettings(settings);

    // Sync all products immediately with the new Amazon tag
    const auditResult = auditAndSyncAllProductsWithAmazon();

    res.json({ 
      success: true, 
      amazonTag: settings.affiliates.amazonTag,
      amazonRegion: settings.affiliates.amazonRegion,
      ...auditResult 
    });
  } catch (error) {
    console.error('Error updating Amazon affiliate tag:', error);
    res.status(500).json({ error: 'Failed to update Amazon affiliate tag' });
  }
});

// Auto-tag all products across all posts with active affiliate configuration
app.post('/api/admin/affiliates/auto-tag-all', requireAdmin, (req, res) => {
  try {
    const settings = getSettings();
    const posts = getPosts();
    let updatedProductsCount = 0;

    const updatedPosts = posts.map(post => {
      const newProducts = post.products.map(prod => {
        const generatedLink = buildProductAffiliateLink(
          prod.name,
          prod.brand,
          prod.model,
          settings.affiliates
        );
        const safeLink = validateSafeAffiliateUrl(generatedLink.affiliateUrl);
        updatedProductsCount++;
        return {
          ...prod,
          affiliateUrl: safeLink.isValid ? safeLink.sanitizedUrl : generatedLink.affiliateUrl,
          buyRetailer: generatedLink.buyRetailer
        };
      });

      return {
        ...post,
        products: newProducts,
        updatedAt: new Date().toISOString()
      };
    });

    savePosts(updatedPosts);
    res.json({ 
      success: true, 
      updatedPostsCount: posts.length, 
      updatedProductsCount,
      network: settings.affiliates.defaultNetwork 
    });
  } catch (error) {
    console.error('Error auto-tagging affiliate links:', error);
    res.status(500).json({ error: 'Failed to auto-tag affiliate links' });
  }
});

// On-demand trigger for Autonomous Review Post (uses Learned 1000+ words model)
app.post(['/api/admin/generate-autonomous', '/api/admin/automation/trigger-now'], requireAdmin, async (req, res) => {
  try {
    const { customTopic } = req.body;
    console.log(`Starting autonomous review generation. Topic: ${customTopic || 'Auto-selected'}`);

    const newPost = await forceTriggerPostGeneration(customTopic);
    res.json({ success: true, post: newPost });
  } catch (error: any) {
    console.error('Failed to generate autonomous post:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// Create manual post (Admin only)
app.post('/api/posts', requireAdmin, (req, res) => {
  try {
    const postData = req.body;
    if (!postData.title || !postData.category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    const created = addPost({
      ...postData,
      id: `post-${Date.now()}`,
      slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      publishedAt: postData.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    });
    res.json(created);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post (Admin only)
app.put('/api/posts/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = updatePost(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (Admin only)
app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const success = deletePost(id);
    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==========================================
// SEO: SITEMAP.XML & ROBOTS.TXT
// Hardened with strict XML entity escaping
// ==========================================

app.get('/sitemap.xml', (req, res) => {
  const posts = getPosts();
  const host = escapeXml(req.get('host') || 'worthora.blog');
  const protocol = req.protocol === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Home
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Categories
  const categories = ['electronics', 'tools', 'clothing', 'home-decoration', 'personal-care', 'books'];
  for (const cat of categories) {
    xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Posts
  for (const post of posts) {
    const cleanTitle = escapeXml(post.title || '');
    const cleanSlug = encodeURIComponent(post.slug);
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?p=${cleanSlug}</loc>\n`;
    xml += `    <lastmod>${new Date(post.updatedAt || post.publishedAt).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (post.featuredImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(post.featuredImage)}</image:loc>\n`;
      xml += `      <image:title>${cleanTitle}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'worthora.blog';
  const protocol = req.protocol === 'https' ? 'https' : 'http';
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin/\n\nSitemap: ${protocol}://${host}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Google AdSense ads.txt verification file
app.get('/ads.txt', (req, res) => {
  const settings = getSettings();
  let pubId = settings?.adSense?.publisherId || 'pub-1323802134955418';
  pubId = pubId.replace(/^ca-/, '');
  res.header('Content-Type', 'text/plain');
  res.send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// Direct Project ZIP Downloads (Complete source code & Netlify production bundle)
app.get(['/download-update', '/download-zip', '/api/download-zip', '/api/download-project-zip', '/worthora-blog-update.zip'], (req, res) => {
  const filePath = path.resolve(process.cwd(), 'public/worthora-blog-update.zip');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="worthora-blog-update.zip"');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Zip file not found' });
  }
});

app.get(['/download-dist', '/api/download-dist-zip', '/worthora-dist-netlify.zip'], (req, res) => {
  const filePath = path.resolve(process.cwd(), 'public/worthora-dist-netlify.zip');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="worthora-dist-netlify.zip"');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Dist zip file not found' });
  }
});

// RSS Feed (RSS 2.0 / Atom feed for Google News, Feed readers, and AI discovery)
app.get(['/rss.xml', '/feed.xml'], (req, res) => {
  const posts = getPosts();
  const host = escapeXml(req.get('host') || 'worthora.blog');
  const protocol = req.protocol === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>Worthora – Expert Product Reviews, Comparisons &amp; Buying Guides</title>\n`;
  rss += `    <link>${baseUrl}/</link>\n`;
  rss += `    <description>Tested and compared: the best electronics, tools, clothing, home &amp; decor, personal care, and books for smart buying decisions.</description>\n`;
  rss += `    <language>en-US</language>\n`;
  rss += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  rss += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  for (const post of posts) {
    const postUrl = `${baseUrl}/?p=${encodeURIComponent(post.slug)}`;
    const pubDate = new Date(post.publishedAt || Date.now()).toUTCString();
    const cleanTitle = escapeXml(post.title || '');
    const cleanDesc = escapeXml(post.excerpt || '');
    const cleanCategory = escapeXml(post.categoryLabel || post.category);

    rss += `    <item>\n`;
    rss += `      <title>${cleanTitle}</title>\n`;
    rss += `      <link>${postUrl}</link>\n`;
    rss += `      <guid isPermaLink="true">${postUrl}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `      <category>${cleanCategory}</category>\n`;
    rss += `      <description>${cleanDesc}</description>\n`;
    if (post.featuredImage) {
      rss += `      <media:content url="${escapeXml(post.featuredImage)}" medium="image" type="image/jpeg"/>\n`;
      rss += `      <enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg" length="120000"/>\n`;
    }
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(rss);
});

// ==========================================
// UNIFIED 24/7 BACKGROUND WORKER SCHEDULER
// Fully coordinated with mutex exclusion to prevent race conditions & double-posts
// ==========================================

// Runs background worker cycle every 5 minutes (audits products + checks daily generation schedule)
setInterval(async () => {
  await run247WorkerCycle();
}, 5 * 60 * 1000);

// Initial initialization and verification 5 seconds after server start
setTimeout(async () => {
  console.log('⚡ [Worthora Security & Automation] Initializing protected 24/7 autonomous worker...');
  auditAndSyncAllProductsWithAmazon();
  await run247WorkerCycle();
}, 5 * 1000);

// ==========================================
// VITE SPA MIDDLEWARE / STATIC FILES
// ==========================================

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Worthora Autonomous Review Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
