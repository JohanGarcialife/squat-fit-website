'use client';

import { useEffect, useState } from 'react';
import { marketingAllowed, CONSENT_EVENT } from './cookieConsent';

// Trustpilot: script oficial de invitaciones (snippet tal cual lo da
// Trustpilot, sin tocar). Vive en un componente compartido porque esta app
// no tiene un único layout raíz: cada grupo de rutas tiene el suyo, y el
// verificador de Trustpilot exige encontrarlo en cualquier página.
//
// Va como <script> crudo dentro del <head> del layout: el verificador de
// dominio de Trustpilot solo lo daba por bueno si aparecía dentro de la
// cabecera del HTML servido. Con next/script (afterInteractive) el snippet
// acababa en el <body> y por eso respondía «We weren't able to verify your
// domain». beforeInteractive tampoco sirve en App Router: no emite el
// snippet, sino un `self.__next_s.push(...)` con el código escapado en JSON.
//
// F2 — gestor de consentimiento: ahora solo se inserta si el visitante
// aceptó la categoría "Marketing" en CookieBanner (antes cargaba siempre,
// incluso antes de elegir — ver TODO histórico ya resuelto). Se activa al
// momento tras aceptar (CONSENT_EVENT), sin recargar.
//
// OJO — verificación de dominio de Trustpilot: al condicionarlo, un visitante
// (o el propio verificador de Trustpilot, que lee el HTML servido sin
// ejecutar JS ni tener cookies) que llegue SIN haber aceptado marketing ya no
// verá el snippet en el <head> servido. La verificación de dominio ya se
// completó (confirmado en producción la noche del 28-jul), pero si Trustpilot
// alguna vez la revalida, puede hacer falta dejarlo suelto (sin condicionar)
// un rato para que vuelva a pasar la comprobación.
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
    <script
      id="trustpilot-invitations"
      dangerouslySetInnerHTML={{ __html: TRUSTPILOT_SNIPPET }}
    />
  );
}
