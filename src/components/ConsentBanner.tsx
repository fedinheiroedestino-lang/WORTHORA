import React from 'react';

const CONSENT_KEY = 'worthora_google_consent';

export type GoogleConsent = { analytics: boolean; ads: boolean };

export function readGoogleConsent(): GoogleConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { analytics: parsed.analytics === true, ads: parsed.ads === true };
  } catch {
    return null;
  }
}

export const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => setVisible(readGoogleConsent() === null), []);
  if (!visible) return null;
  const save = (consent: GoogleConsent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.ads ? 'granted' : 'denied',
      ad_user_data: consent.ads ? 'granted' : 'denied',
      ad_personalization: consent.ads ? 'granted' : 'denied'
    });
    window.dispatchEvent(new CustomEvent('worthora:google-consent', { detail: consent }));
    setVisible(false);
  };
  return <aside role="dialog" aria-label="Preferências de privacidade" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
    <h2 className="text-base font-black text-stone-900">Preferências de privacidade</h2>
    <p className="mt-2 text-sm leading-relaxed text-stone-600">Usamos Analytics para entender leituras agregadas e AdSense para exibir publicidade. Você pode aceitar ou recusar cada finalidade. Sua escolha pode ser alterada nas preferências de privacidade.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white" onClick={() => save({ analytics: true, ads: true })}>Aceitar analytics e anúncios</button>
      <button className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800" onClick={() => save({ analytics: true, ads: false })}>Aceitar apenas analytics</button>
      <button className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800" onClick={() => save({ analytics: false, ads: false })}>Recusar</button>
    </div>
  </aside>;
};
