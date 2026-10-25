/**
 * Worthora Value-First Analytics & Measurement Suite
 * Compatible with Google Analytics 4 (GA4), Google Tag Manager (GTM), and Search Console reconciliation.
 * "Meça valor, não apenas volume."
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface ValueEventPayload {
  eventName: 
    | 'article_read_progress'
    | 'source_citation_click'
    | 'newsletter_signup'
    | 'article_share'
    | 'affiliate_click'
    | 'internal_link_click';
  postSlug: string;
  postCategory?: string;
  postTitle?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export function pushGtmEvent(event: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event,
        ...params,
        timestamp: new Date().toISOString()
      });

      if (typeof window.gtag === 'function') {
        window.gtag('event', event, params);
      }
    }
  } catch (err) {
    // Suppress console clutter
  }
}

/**
 * Sends event to backend to increment the Publicado metrics in the Editorial Queue
 */
async function sendEventToBackend(payload: ValueEventPayload) {
  try {
    if (typeof window === 'undefined') return;
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  } catch (e) {}
}

/**
 * 1. Tracks genuine article reading progress (25%, 50%, 75%, 100%)
 */
export function trackArticleReadDepth(depthPercent: 25 | 50 | 75 | 100, postSlug: string, postTitle?: string, postCategory?: string) {
  pushGtmEvent('article_read_depth', {
    depth: depthPercent,
    post_slug: postSlug,
    post_title: postTitle,
    category: postCategory
  });

  if (depthPercent === 50 || depthPercent === 100) {
    sendEventToBackend({
      eventName: 'article_read_progress',
      postSlug,
      postCategory,
      postTitle,
      details: { depth: depthPercent }
    });
  }
}

/**
 * 2. Tracks when readers click to inspect a cited source / grounded fact
 */
export function trackSourceCitationClick(sourceUrl: string, domain: string, claim: string, postSlug: string) {
  pushGtmEvent('source_citation_click', {
    source_url: sourceUrl,
    source_domain: domain,
    supported_claim: claim,
    post_slug: postSlug
  });

  sendEventToBackend({
    eventName: 'source_citation_click',
    postSlug,
    details: { sourceUrl, domain, claim }
  });
}

/**
 * 3. Tracks newsletter subscriptions from an article
 */
export function trackNewsletterSignup(email: string, sourceSlug: string) {
  pushGtmEvent('newsletter_signup', {
    source_slug: sourceSlug
  });

  sendEventToBackend({
    eventName: 'newsletter_signup',
    postSlug: sourceSlug,
    details: { emailMasked: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') }
  });
}

/**
 * 4. Tracks social share actions
 */
export function trackArticleShare(platform: string, postSlug: string) {
  pushGtmEvent('article_share', {
    platform,
    post_slug: postSlug
  });

  sendEventToBackend({
    eventName: 'article_share',
    postSlug,
    details: { platform }
  });
}

/**
 * 5. Tracks outbound affiliate clicks with transparent verification status
 */
export function trackAffiliateClick(
  productName: string, 
  retailer: string, 
  verificationStatus: 'verified' | 'unverified', 
  postSlug: string
) {
  pushGtmEvent('affiliate_click', {
    product_name: productName,
    retailer,
    verification_status: verificationStatus,
    post_slug: postSlug
  });

  sendEventToBackend({
    eventName: 'affiliate_click',
    postSlug,
    details: { productName, retailer, verificationStatus }
  });
}

/**
 * 6. Tracks internal link clicks to related articles
 */
export function trackInternalLinkClick(targetSlug: string, currentSlug: string) {
  pushGtmEvent('internal_link_click', {
    target_slug: targetSlug,
    current_slug: currentSlug
  });

  sendEventToBackend({
    eventName: 'internal_link_click',
    postSlug: currentSlug,
    details: { targetSlug }
  });
}
