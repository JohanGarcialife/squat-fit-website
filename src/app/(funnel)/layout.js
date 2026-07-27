import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import TrustpilotInvitations from "@/app/components/TrustpilotInvitations";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tu recomendación · Squad Fit",
  description:
    "Puntúa qué necesitas ahora mismo y te decimos qué encaja mejor contigo.",
};

// Layout a pantalla completa, sin cabecera ni pie: las páginas de este grupo
// son pasos de venta (el lead llega desde el chat) y cualquier menú compite
// con el único CTA que importa. Mismo patrón que el onboarding.
export default function FunnelLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <GoogleAnalytics />
        <TrustpilotInvitations />
      </body>
    </html>
  );
}
