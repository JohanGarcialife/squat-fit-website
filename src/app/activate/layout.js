import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Squad Fit — Activar cuenta",
  description: "Activación de tu cuenta de Squad Fit.",
};

// /activate estaba fuera de todos los grupos de layout y se servía SIN
// globals.css: en producción la página salía en texto plano (captura del
// 18 jul). Este layout mínimo carga los estilos y la fuente.
export default function ActivateLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
