import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";
import ToasterProvider from "@/components/ToasterProvider";
import CartDrawer from "../components/CartDrawer";

import Sidebar from "./(routes)/panel-control/_components/Sidebar";
import CookieBanner from "@/app/components/CookieBanner";
import AppTour from "@/app/components/AppTour";

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
  title: "Squad Fit",
  description: "Squad Fit Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Trustpilot: dentro del <head> para que verifique el dominio. */}
        <TrustpilotInvitations />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <div className="min-h-screen bg-background flex">
        <ToasterProvider />
        <Sidebar />
        {/* En móvil el Sidebar colapsa a una barra superior fija (h-16); este
            padding evita que el contenido quede debajo. En lg+ no hace falta. */}
        <div className="flex-1 min-w-0 pt-16 lg:pt-0">{children}</div>
        <CartDrawer />
        {/* Tour de bienvenida: en el layout del panel (no en la web pública)
            para que el relanzamiento desde Ajustes funcione en cualquier
            pestaña sin desmontarse al navegar. */}
        <AppTour />
        </div>
      <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
