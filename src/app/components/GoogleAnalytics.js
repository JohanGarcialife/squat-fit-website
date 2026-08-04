'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { analyticsAllowed, CONSENT_EVENT } from './cookieConsent';

// Flujo de datos GA4 de squadfit.es (propiedad "Squad Fit - GA4").
// La medición mejorada (activada en GA4) cubre las vistas de página en la
// navegación SPA, así que basta con inicializar gtag una vez.
const GA_MEASUREMENT_ID = "G-82Z4RPHL1B";

// Hosts donde SÍ se mide. Todo lo demás —`localhost`, las previsualizaciones
// `*.vercel.app`, cualquier dominio de pruebas— queda fuera.
//
// No es teórico: el 4-ago-2026, al filtrar GA4 por «Nombre de host», la lista de
// valores traía `localhost` y cuatro `squatfit-website-….vercel.app` junto a los
// dominios reales. O sea que cada `npm run dev` y cada preview de un PR estaban
// escribiendo sesiones y eventos en la MISMA propiedad que produce los números
// que luego se miran para decidir.
//
// La comprobación es por hostname en el navegador y no por variable de entorno
// a propósito: el build de preview y el de producción son el mismo, y el único
// dato que de verdad distingue dónde se está ejecutando es dónde está abierta la
// página.
//
// `www.squadfit.es` hoy devuelve un 308 al dominio raíz, así que nunca llega a
// renderizar; se deja en la lista de todas formas porque si algún día se sirve
// desde ahí, perder la medición sería peor que tenerla de más.
const HOSTS_DE_PRODUCCION = ['squadfit.es', 'www.squadfit.es'];

function esHostDeProduccion() {
  if (typeof window === 'undefined') return false;
  return HOSTS_DE_PRODUCCION.includes(window.location.hostname);
}

// F2 — gestor de consentimiento: GA4 solo se inserta si el visitante aceptó
// la categoría "Analítica" en CookieBanner. Por defecto (antes de elegir, o
// si rechaza) este componente no renderiza nada, así que el script nunca
// llega a pedirse. Se activa al momento tras aceptar (CONSENT_EVENT), sin
// necesitar recargar la página.
export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);
  const [enProduccion, setEnProduccion] = useState(false);

  useEffect(() => {
    // Las dos condiciones se evalúan en el efecto, no al renderizar, porque en
    // el servidor no hay `window` y el HTML tiene que salir igual en ambos
    // lados para no romper la hidratación.
    setEnProduccion(esHostDeProduccion());
    setAllowed(analyticsAllowed());
    const onChange = () => setAllowed(analyticsAllowed());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Hacen falta las dos: consentimiento del visitante Y host de producción.
  if (!allowed || !enProduccion) return null;

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
