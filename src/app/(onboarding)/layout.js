import { Inter } from "next/font/google";
import "../globals.css";
import "../form-motion.css";
import ToasterProvider from "@/components/ToasterProvider";

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
      <body className={`${inter.variable} antialiased`}>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
