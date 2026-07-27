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

export const metadata = {
  title: "Squad Fit",
  description: "Squad Fit Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
