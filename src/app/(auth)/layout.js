import { Inter } from "next/font/google";
import "../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Squat Fit",
  description: "Squat Fit Website",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Toaster />
        <div className="min-h-screen bg-background ">
        
        <Header />
        {children}
        {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
