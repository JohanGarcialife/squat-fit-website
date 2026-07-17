'use client';

import React from 'react';
import Image from 'next/image';

export default function GuaranteeSection() {
  // Genera un círculo festoneado (scalloped circle) dinámicamente en SVG.
  // Coordenadas redondeadas a 2 decimales: los últimos decimales de Math.cos/sin
  // pueden variar entre el motor JS del servidor y el del navegador, y eso
  // provocaba un error de hidratación de React.
  const round = (n) => Math.round(n * 100) / 100;
  const generateScallopPath = (cx, cy, r1, r2, points) => {
    let path = '';
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const nextAngle = ((i + 1) * 2 * Math.PI) / points;
      const midAngle = angle + (nextAngle - angle) / 2;

      const x1 = round(cx + r1 * Math.cos(angle));
      const y1 = round(cy + r1 * Math.sin(angle));

      const xm = round(cx + r2 * Math.cos(midAngle));
      const ym = round(cy + r2 * Math.sin(midAngle));

      const x2 = round(cx + r1 * Math.cos(nextAngle));
      const y2 = round(cy + r1 * Math.sin(nextAngle));

      if (i === 0) {
        path += `M ${x1} ${y1} Q ${xm} ${ym} ${x2} ${y2} `;
      } else {
        path += `Q ${xm} ${ym} ${x2} ${y2} `;
      }
    }
    return path + 'Z';
  };

  const scallopPath = generateScallopPath(100, 100, 85, 78, 36);

  return (
    <section className="relative w-full bg-white py-16 sm:py-24 px-6 sm:px-12 md:px-24">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Banner Principal con Degradado de Imagen --- */}
        <div className="relative w-full rounded-[36px] sm:rounded-[48px] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 shadow-xl shadow-slate-100/50 overflow-hidden min-h-[220px] isolate">
          
          {/* Background Image */}
          <Image
            src="/GuaranteeBg.png"
            alt="Fondo de Garantía"
            fill
            className="object-cover -z-10 animate-fade-in"
          />

          {/* --- Columna 1: Insignia de Garantía --- */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-48 h-48 sm:w-52 sm:h-52 select-none hover:scale-[1.02] transition-transform duration-300">
            {/* SVG Scalloped Badge */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-md">
              <path d={scallopPath} fill="#ffffff" />
            </svg>

            {/* Contenido dentro del Sello */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
              <span className="text-[#1A1A1A] font-extrabold text-lg sm:text-xl leading-tight">
                Garantía
              </span>
              <span className="text-[#1A1A1A] font-extrabold text-lg sm:text-xl leading-tight mb-2">
                asegurada
              </span>
              
              {/* Shield Icon with Star inside */}
              <svg className="w-10 h-10 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11.5" r="3" />
                <polygon points="12,10 12.7,11.5 14.2,11.7 13.1,12.8 13.4,14.3 12,13.5 10.6,14.3 10.9,12.8 9.8,11.7 11.3,11.5" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* --- Columna 2: Título Principal --- */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-[#1A1A1A] font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight max-w-md">
              Asumimos el riesgo contigo
            </h3>
          </div>

          {/* --- Columna 3: Descripción de la Garantía --- */}
          <div className="w-full md:w-[35%] text-center md:text-left flex-shrink-0">
            <p className="text-slate-800 font-medium text-lg sm:text-xl leading-relaxed max-w-sm mx-auto md:mx-0">
              Si cumples el programa según las indicaciones y no obtienes resultados, tienes garantía de devolución.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
