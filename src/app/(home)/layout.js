import { Inter } from "next/font/google";
import "../globals.css";
// <FormularioPendiente> (más abajo) se pinta con la clase `.sf-flotante`, que
// vive en form-motion.css. Sin este import el botón aparecía de golpe en la
// web pública, sin subir desde abajo: la hoja solo se cargaba en el layout de
// (onboarding), que es justo donde ese botón NO se muestra.
// Se puede importar sin miedo: form-motion.css solo define clases `.sf-*` y
// variables propias (--ms-*, --px-*, --ease-ui), ninguna usada por globals.css,
// y de la web pública solo <FormularioPendiente> lleva clases `sf-`.
import "../form-motion.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FormularioPendiente from "../components/FormularioPendiente";
import FloatingCartWidget from "../components/FloatingCartWidget"; // Importar FloatingCartWidget
import CartDrawer from "../components/CartDrawer";
import ToasterProvider from "@/components/ToasterProvider";
import AutoShineObserver from "../components/AutoShineObserver";
import UTMCapture from "../components/UTMCapture";
import CookieBanner from "@/app/components/CookieBanner";
import CartScrollRestore from "@/app/components/CartScrollRestore";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";

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
  // Bloque Open Graph / Twitter: hasta ahora ninguna página emitía og: ni
  // twitter:, así que un enlace de squadfit.es pegado en WhatsApp, Instagram,
  // Facebook o Telegram salía pelado (sin título, sin imagen, sin
  // descripción). Este es el genérico de todo el grupo (home): cada página
  // pública lo hereda salvo que declare el suyo propio (programa, cocina,
  // cursos ya lo hacen). La imagen sale de `opengraph-image.jpg` /
  // `twitter-image.jpg` en esta misma carpeta (convención de fichero de
  // Next), que se resuelve sola a URL absoluta gracias a `metadataBase`.
  openGraph: {
    title: "Squad Fit — Logra tu mejor versión",
    description:
      "El programa de dieta, entreno y mentalidad para un cambio físico real y duradero.",
    url: "./",
    siteName: "Squad Fit",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Squad Fit — Logra tu mejor versión",
    description:
      "El programa de dieta, entreno y mentalidad para un cambio físico real y duradero.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Trustpilot: script oficial de invitaciones (reseñas post-compra).
            Tiene que ir dentro del <head> para que Trustpilot verifique el
            dominio. */}
        <TrustpilotInvitations />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <div className="min-h-screen bg-background ">
        <ToasterProvider />
        <AutoShineObserver />
        <Header />
        <UTMCapture />
        <CartScrollRestore />
        {children}
        <Footer />
        {/* Vuelve a ofrecer terminar un formulario dejado a medias. */}
        <FormularioPendiente />
        <FloatingCartWidget /> {/* Renderizar el FloatingCartWidget aquí */}
        <CartDrawer />
        </div>
      <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
