'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { marketingAllowed, CONSENT_EVENT } from './cookieConsent';

// Trustpilot: script oficial de invitaciones (snippet tal cual lo da
// Trustpilot, sin tocar). Vive en un componente compartido porque esta app
// no tiene un único layout raíz: cada grupo de rutas tiene el suyo.
//
// Solo se carga si el visitante aceptó la categoría "Marketing" en
// CookieBanner. Se activa al momento tras aceptar (CONSENT_EVENT), sin
// necesitar recargar.
//
// POR QUÉ next/script Y NO UN <script> CRUDO (28-jul, corregido tras
// encontrarlo en producción): históricamente esto era un `<script>` con
// dangerouslySetInnerHTML porque el verificador de dominio de Trustpilot solo
// daba por bueno el snippet si aparecía dentro del <head> del HTML SERVIDO —
// y en aquel momento el componente se renderizaba en el servidor, así que
// funcionaba. Al condicionarlo al consentimiento pasó a renderizarse en el
// cliente, y ahí ese `<script>` YA NO SE EJECUTA: React lo mete en el DOM,
// pero un script insertado así no lo corre el navegador. Resultado: el
// snippet estaba en la página y aun así `window.tp` no existía y
// tp.min.js no se pedía nunca — las invitaciones de reseña llevaban
// desde el despliegue del gestor de cookies sin funcionar, en silencio.
// next/script sí lo ejecuta (es lo que ya hacía GoogleAnalytics.js al lado).
//
// OJO — verificación de dominio de Trustpilot: desde que esto depende del
// consentimiento, el verificador (que lee el HTML servido sin ejecutar JS ni
// tener cookies) ya no encuentra el snippet, con este cambio ni con el
// anterior. La verificación ya está hecha; si algún día la revalidan, habrá
// que dejar el snippet suelto un rato para volver a pasarla.
const TRUSTPILOT_SNIPPET = `(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register','izhv6K6cD6ejsrjB');`;

export default function TrustpilotInvitations() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(marketingAllowed());
    const onChange = () => setAllowed(marketingAllowed());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!allowed) return null;

  return (
    <Script id="trustpilot-invitations" strategy="afterInteractive">
      {TRUSTPILOT_SNIPPET}
    </Script>
  );
}
