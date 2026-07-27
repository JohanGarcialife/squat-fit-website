import { Inter } from "next/font/google";
import "../globals.css";
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

export const metadata = {
  title: "Squad Fit",
  description: "Squad Fit Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
