import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";
import ToasterProvider from "@/components/ToasterProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingCartWidget from "../components/FloatingCartWidget";
import CartDrawer from "../components/CartDrawer";
import CookieBanner from "@/app/components/CookieBanner";

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
  // Mismo criterio que en (home): título propio por página vía plantilla.
  // /login y /register están en el sitemap, así que también necesitan uno
  // distinto cada una — lo ponen sus layouts de ruta.
  title: {
    default: "Squad Fit",
    template: "%s · Squad Fit",
  },
  description:
    "Accede a tu cuenta de Squad Fit para entrar a tu programa, tus cursos y tu recetario.",
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
        {/* Un solo proveedor de toasts (antes había ToasterProvider + Toaster,
            así cada aviso salía duplicado y descolocado en el iPhone). */}
        <ToasterProvider />
        <div className="min-h-screen bg-background ">
        
        <Header />
        {children}
        {/* Mismo pie y carrito que el layout de (home): antes el login se
            quedaba sin footer y sin forma de abrir el carrito */}
        <Footer />
        <FloatingCartWidget />
        <CartDrawer />
        </div>
      <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
