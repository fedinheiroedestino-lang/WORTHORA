import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { AdSenseConfig } from '../types';
import { readGoogleConsent, GoogleConsent } from './ConsentBanner';

interface AdSenseUnitProps { format: 'leaderboard' | 'in-article' | 'sidebar' | 'in-feed' | 'sticky-bottom'; config?: AdSenseConfig; className?: string; }

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ config, ...props }) => {
  if (config && !config.enabled) return null;
  return <AdSenseUnitContent config={config} {...props} />;
};

const AdSenseUnitContent: React.FC<AdSenseUnitProps> = ({ format, config, className = '' }) => {
  const [consent, setConsent] = React.useState<GoogleConsent | null>(() => readGoogleConsent());
  const [adFilled, setAdFilled] = React.useState(false);
  const insRef = React.useRef<HTMLModElement>(null);
  React.useEffect(() => {
    const onConsent = (event: Event) => setConsent((event as CustomEvent<GoogleConsent>).detail);
    window.addEventListener('worthora:google-consent', onConsent);
    return () => window.removeEventListener('worthora:google-consent', onConsent);
  }, []);
  React.useEffect(() => {
    if (!consent?.ads || config?.testMode) return;
    try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch { /* blocked/duplicate ad slot */ }
    const el = insRef.current; if (!el) return;
    const checkFill = () => setAdFilled(el.getAttribute('data-ad-status') === 'filled');
    checkFill(); const observer = new MutationObserver(checkFill);
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'] });
    return () => observer.disconnect();
  }, [consent?.ads, config?.testMode, format]);
  if (!consent?.ads) return null;
  const publisherId = config?.publisherId || import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '';
  if (!publisherId) return null;
  const cleanPubId = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;
  const slotMap = { leaderboard: config?.slots?.topLeaderboard || '7482910384', 'in-article': config?.slots?.inArticle || '9384721092', sidebar: config?.slots?.sidebarSkyscraper || '8172635409', 'in-feed': config?.slots?.inFeed || '6253410982', 'sticky-bottom': config?.slots?.stickyFooter || '5192837461' };
  const slotId = slotMap[format];
  const affiliateTag = (() => { try { const saved = localStorage.getItem('worthora_settings_override'); const parsed = saved ? JSON.parse(saved) : null; return parsed?.affiliates?.amazonTag || ''; } catch { return ''; } })();
  const offer = { headline: 'Compare current retailer options', url: `https://www.amazon.com/s?k=${encodeURIComponent(format)}${affiliateTag ? `&tag=${encodeURIComponent(affiliateTag)}` : ''}`, cta: 'Check offers' };
  return <div className={`my-8 ${className}`} aria-label="Publicidade e links patrocinados">
    <div className={`relative w-full overflow-hidden transition-all duration-500 ${adFilled ? 'min-h-[90px]' : 'min-h-0'}`}>
      <ins ref={insRef} className="adsbygoogle block" style={{ display: 'block' }} data-ad-client={cleanPubId} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-stone-700">
      <div className="mb-1 flex items-center gap-2"><Info className="h-3 w-3" /><span>Link afiliado patrocinado; preço e disponibilidade variam.</span></div>
      <div className="flex items-center justify-between gap-2"><span className="truncate">{offer.headline}</span><a href={offer.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-500 px-3 py-1 font-bold text-stone-950">{offer.cta}<ExternalLink className="h-3 w-3" /></a></div>
    </div>
  </div>;
};
