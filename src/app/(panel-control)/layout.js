import { Inter } from "next/font/google";
import "../globals.css";

import Sidebar from "./(routes)/panel-control/_components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Squat Fit",
  description: "Squat Fit Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <div className="min-h-screen bg-background flex">
        
        <Sidebar />
        {children}
        </div>
      </body>
    </html>
  );
}
