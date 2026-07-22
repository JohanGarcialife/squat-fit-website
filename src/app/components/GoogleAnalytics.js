import Script from "next/script";

// Flujo de datos GA4 de squadfit.es (propiedad "Squad Fit - GA4").
// La medición mejorada (activada en GA4) cubre las vistas de página en la
// navegación SPA, así que basta con inicializar gtag una vez.
const GA_MEASUREMENT_ID = "G-82Z4RPHL1B";

export default function GoogleAnalytics() {
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
