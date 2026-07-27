import Script from "next/script";

// Trustpilot: script oficial de invitaciones (snippet tal cual lo da
// Trustpilot, sin tocar). Vive en un componente compartido porque esta app
// no tiene un único layout raíz: cada grupo de rutas tiene el suyo, y el
// verificador de Trustpilot exige encontrar el script en cualquier página.
export default function TrustpilotInvitations() {
  return (
    <Script id="trustpilot-invitations" strategy="afterInteractive">
      {`(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register','izhv6K6cD6ejsrjB');`}
    </Script>
  );
}
