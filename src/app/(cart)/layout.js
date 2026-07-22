import { Inter } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
import ToasterProvider from "@/components/ToasterProvider";
import UTMCapture from "@/app/components/UTMCapture";
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
        <div className="min-h-screen bg-background ">
        <ToasterProvider />
        {/* <Header /> */}
        <UTMCapture />
        {children}
        {/* <Footer /> */}
        </div>
      <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
