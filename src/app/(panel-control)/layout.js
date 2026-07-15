import { Inter } from "next/font/google";
import "../globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import CartDrawer from "../components/CartDrawer";

import Sidebar from "./(routes)/panel-control/_components/Sidebar";

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
        <div className="min-h-screen bg-background flex">
        <ToasterProvider />
        <Sidebar />
        {children}
        <CartDrawer />
        </div>
      </body>
    </html>
  );
}
