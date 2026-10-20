import React from 'react';
import { readGoogleConsent, GoogleConsent } from './ConsentBanner';

interface GoogleIntegrationsProps { adSensePublisherId?: string; adSenseEnabled?: boolean; }
function cleanPublisherId(value?: string): string { const id = (value || '').trim(); return id.startsWith('ca-pub-') ? id : id ? `ca-${id}` : ''; }

export const GoogleIntegrations: React.FC<GoogleIntegrationsProps> = ({ adSensePublisherId, adSenseEnabled }) => {
  const [consent, setConsent] = React.useState<GoogleConsent | null>(() => readGoogleConsent());
  React.useEffect(() => {
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || function gtag() { win.dataLayer.push(arguments); };
    win.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
    const saved = readGoogleConsent();
    if (saved) win.gtag('consent', 'update', { analytics_storage: saved.analytics ? 'granted' : 'denied', ad_storage: saved.ads ? 'granted' : 'denied', ad_user_data: saved.ads ? 'granted' : 'denied', ad_personalization: saved.ads ? 'granted' : 'denied' });
    const onConsent = (event: Event) => setConsent((event as CustomEvent<GoogleConsent>).detail);
    window.addEventListener('worthora:google-consent', onConsent);
    const verification = (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();
    if (verification) {
      let meta = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement | null;
      if (!meta) { meta = document.createElement('meta'); meta.name = 'google-site-verification'; document.head.appendChild(meta); }
      meta.content = verification;
    }
    return () => window.removeEventListener('worthora:google-consent', onConsent);
  }, []);

  React.useEffect(() => {
    if (!consent?.analytics) return;
    const win = window as any;
    const measurementId = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim();
    if (!measurementId) return;
    const scriptId = 'google-analytics-gtag';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script'); script.id = scriptId; script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`; document.head.appendChild(script);
    }
    win.gtag('js', new Date()); win.gtag('config', measurementId, { anonymize_ip: true, send_page_view: true });
    win.__worthoraGoogleAnalytics = { measurementId, configured: true };
  }, [consent?.analytics]);

  React.useEffect(() => {
    if (!consent?.ads || adSenseEnabled === false) return;
    const publisherId = cleanPublisherId(adSensePublisherId || import.meta.env.VITE_ADSENSE_PUBLISHER_ID);
    if (!publisherId) return;
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script'); script.id = scriptId; script.async = true; script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`; document.head.appendChild(script);
    }
    (window as any).__worthoraAdSense = { publisherId, configured: true };
  }, [adSensePublisherId, adSenseEnabled, consent?.ads]);
  return null;
};
