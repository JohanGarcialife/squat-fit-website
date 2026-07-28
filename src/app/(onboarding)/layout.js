import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";
import "../form-motion.css";
import ToasterProvider from "@/components/ToasterProvider";
import CookieBanner from "@/app/components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
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
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
