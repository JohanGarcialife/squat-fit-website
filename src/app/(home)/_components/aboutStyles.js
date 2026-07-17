import Image from 'next/image';
import React from 'react';

// ── Sistema visual unificado de "Nosotros" ───────────────────────────────────
// Estilo legal/sobrio (tipo página de Términos de Apple): una columna estrecha
// centrada, tipografía contenida y los MISMOS márgenes, títulos y tamaños en
// todas las pestañas. Antes cada pestaña iba por libre (h1 de text-8xl, cuerpos
// de text-3xl vs text-2xl, py-10 vs py-16, fotos de 500-550 px estiradas…).
export const ABOUT = {
  // Columna de lectura (misma anchura en las 4 pestañas)
  page: 'max-w-3xl mx-auto animate-fadeIn',
  // Antetítulo naranja pequeño (toque moderno, discreto)
  eyebrow: 'text-xs font-bold tracking-[0.15em] uppercase text-[#FF690B]',
  // Título de pestaña (antes text-8xl → ahora sobrio)
  h1: 'text-3xl sm:text-4xl font-bold text-[#363C98] tracking-tight leading-tight',
  // Entradilla bajo el h1
  lead: 'mt-3 text-lg text-gray-500 leading-relaxed',
  // Encabezado de sección
  h2: 'text-xl sm:text-2xl font-bold text-[#363C98]',
  // Sub-encabezado
  h3: 'text-base font-semibold text-[#363C98]',
  // Cuerpo de texto (antes text-3xl → ahora legible y sobrio)
  p: 'text-base sm:text-lg text-gray-600 leading-relaxed',
  // Ritmo vertical entre secciones (igual en todas partes)
  section: 'mt-12',
  // Separador fino opcional
  divider: 'mt-12 pt-2 border-t border-gray-100',
};

// Retrato con tamaño y estilo iguales en todas las pestañas (antes 500-550 px y
// object-cover que estiraba la foto). Relación 4:5, esquinas redondeadas.
export function Portrait({ src, alt, className = '' }) {
  return (
    <div className={`relative w-[240px] sm:w-[280px] aspect-[4/5] mx-auto flex-shrink-0 ${className}`}>
      <Image src={src} alt={alt} fill sizes="300px" className="object-cover rounded-2xl shadow-sm" />
    </div>
  );
}
