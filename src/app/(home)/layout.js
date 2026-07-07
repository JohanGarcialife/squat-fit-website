import { Inter } from "next/font/google";
import "../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingCartWidget from "../components/FloatingCartWidget"; // Importar FloatingCartWidget
import ToasterProvider from "@/components/ToasterProvider";

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
        <div className="min-h-screen bg-background ">
        <ToasterProvider />
        <Header />
        {children}
        <Footer />
        <FloatingCartWidget /> {/* Renderizar el FloatingCartWidget aquí */}
        </div>
        {/* Chivato temporal de maquetación: añadir ?debug=1 a la URL para ver
            en pantalla qué elementos desbordan el ancho (QUITAR tras depurar) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if (location.search.indexOf('debug') !== -1) {
  setTimeout(function () {
    var vw = document.documentElement.clientWidth;
    var bad = [];
    document.querySelectorAll('body *').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if ((r.width > vw + 2 || r.left < -2) && !el.closest('.slick-list') && el.id !== 'sqf-debug') {
        bad.push(Math.round(r.left) + 'L ' + Math.round(r.width) + 'w ' + el.tagName + '.' + String(el.className).slice(0, 55));
      }
    });
    var reveals = document.querySelectorAll('.will-change-\\\\[opacity\\\\,transform\\\\]');
    var vis = 0; reveals.forEach(function (el) { if (el.className.indexOf('opacity-100') !== -1) vis++; });
    var d = document.createElement('div');
    d.id = 'sqf-debug';
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:55vh;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:8px;z-index:99999;white-space:pre-wrap;';
    d.textContent = 'vw=' + vw + ' scrollW=' + document.documentElement.scrollWidth + ' innerW=' + window.innerWidth + ' reveals=' + vis + '/' + reveals.length + '\\n' + bad.slice(0, 25).join('\\n');
    document.body.appendChild(d);
  }, 3000);
}
`,
          }}
        />
      </body>
    </html>
  );
}
