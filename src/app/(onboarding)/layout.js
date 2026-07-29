import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";
import "../form-motion.css";
import ToasterProvider from "@/components/ToasterProvider";
import CookieBanner from "@/app/components/CookieBanner";
import UTMCapture from "@/app/components/UTMCapture";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// La web se sirve en squadfit.es y en www.squadfit.es, y hasta ahora las dos
// devolvían 200 con el MISMO html: dos copias del sitio para Google, que
// repartía entre ellas la autoridad de los enlaces. El redirect de www al apex
// ya está puesto en Vercel; esto es el refuerzo desde el propio html.
//
// `metadataBase` es lo que permite que la canónica salga como URL absoluta (sin
// él Next no sabe con qué dominio componerla). De paso deja preparado el día que
// se añadan imágenes Open Graph: hoy el sitio no tiene ninguna etiqueta og:, así
// que al compartir un enlace no sale tarjeta de vista previa en ningún sitio.
//
// `canonical: './'` se resuelve contra metadataBase y la ruta actual, así que
// cada página se declara canónica de sí misma SIEMPRE en el apex.
const SITIO = new URL('https://squadfit.es');

export const metadata = {
  metadataBase: SITIO,
  alternates: { canonical: './' },
  title: "Squad Fit — Empecemos",
  description: "Cuéntanos sobre ti para adaptar tu plan.",
};

// Layout a pantalla completa (sin cabecera, pie ni menú): el onboarding es un
// flujo inmersivo tipo formulario.
export default function OnboardingLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Trustpilot: dentro del <head> para que verifique el dominio. */}
        <TrustpilotInvitations />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ToasterProvider />
        {children}
        {/* Atribución: sin esto, quien aterriza DIRECTO en este grupo de rutas
            (un anuncio, un enlace de YouTube, una búsqueda de Google) no deja
            rastro de por dónde vino, y el lead se guarda como «web» a secas. */}
        <UTMCapture />
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
