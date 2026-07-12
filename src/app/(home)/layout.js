import { Inter } from "next/font/google";
import "../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingCartWidget from "../components/FloatingCartWidget"; // Importar FloatingCartWidget
import CartDrawer from "../components/CartDrawer";
import ToasterProvider from "@/components/ToasterProvider";
import AutoShineObserver from "../components/AutoShineObserver";
import UTMCapture from "../components/UTMCapture";

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
      <body
        className={`${inter.variable} antialiased`}
      >
        <div className="min-h-screen bg-background ">
        <ToasterProvider />
        <AutoShineObserver />
        <Header />
        <UTMCapture />
        {children}
        <Footer />
        <FloatingCartWidget /> {/* Renderizar el FloatingCartWidget aquí */}
        <CartDrawer />
        </div>
      </body>
    </html>
  );
}
