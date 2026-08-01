'use client';

import React from 'react';
import { Gift } from 'lucide-react';

// Insignia de "muestra gratuita", compartida entre la biblioteca de Mi cocina
// en PDF (panel-cocina/page.js + el lector panel-cocina/libro/[id]/page.js,
// contra book_id/version_id) y las recetas nativas (recipe.is_free_sample,
// rama feat/muestras-gratis-y-ranking-recetas del backend). Mismo idioma
// visual que el resto del panel: píldora redondeada, mayúsculas pequeñas —
// el mismo patrón que el "En preparación" de ProgramSections.js, en el
// naranja de marca en vez de gris (aquí SÍ hay algo que mostrar).
export default function FreeSampleBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FF690B] bg-white border border-[#FF690B]/30 rounded-full px-3 py-1 ${className}`}
    >
      <Gift className="w-3 h-3" /> Muestra gratis
    </span>
  );
}
