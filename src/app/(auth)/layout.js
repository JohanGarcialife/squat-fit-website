import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
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
