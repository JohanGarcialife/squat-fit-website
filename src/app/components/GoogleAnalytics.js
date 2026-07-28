'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { analyticsAllowed, CONSENT_EVENT } from './cookieConsent';

// Flujo de datos GA4 de squadfit.es (propiedad "Squad Fit - GA4").
// La medición mejorada (activada en GA4) cubre las vistas de página en la
// navegación SPA, así que basta con inicializar gtag una vez.
const GA_MEASUREMENT_ID = "G-82Z4RPHL1B";

// F2 — gestor de consentimiento: GA4 solo se inserta si el visitante aceptó
// la categoría "Analítica" en CookieBanner. Por defecto (antes de elegir, o
// si rechaza) este componente no renderiza nada, así que el script nunca
// llega a pedirse. Se activa al momento tras aceptar (CONSENT_EVENT), sin
// necesitar recargar la página.
export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(analyticsAllowed());
    const onChange = () => setAllowed(analyticsAllowed());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
