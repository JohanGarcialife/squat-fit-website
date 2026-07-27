// Trustpilot: script oficial de invitaciones (snippet tal cual lo da
// Trustpilot, sin tocar). Vive en un componente compartido porque esta app
// no tiene un único layout raíz: cada grupo de rutas tiene el suyo, y el
// verificador de Trustpilot exige encontrarlo en cualquier página.
//
// Va como <script> crudo y SIEMPRE dentro del <head> del layout: el
// verificador de dominio de Trustpilot solo lo da por bueno si aparece dentro
// de la cabecera del HTML servido. Con next/script (afterInteractive) el
// snippet acababa en el <body> y por eso respondía «We weren't able to verify
// your domain». beforeInteractive tampoco sirve en App Router: no emite el
// snippet, sino un `self.__next_s.push(...)` con el código escapado en JSON.
//
// TODO: condicionar a consentimiento de cookies (es un script de un tercero;
// hoy carga siempre para poder verificar el dominio).
const TRUSTPILOT_SNIPPET = `(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register','izhv6K6cD6ejsrjB');`;

export default function TrustpilotInvitations() {
  return (
    <script
      id="trustpilot-invitations"
      dangerouslySetInnerHTML={{ __html: TRUSTPILOT_SNIPPET }}
    />
  );
}
