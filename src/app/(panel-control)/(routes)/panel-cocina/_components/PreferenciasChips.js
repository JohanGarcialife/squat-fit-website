'use client';

import { Leaf } from 'lucide-react';
import {
  PREFERENCIAS,
  usePreferenciasAlimentarias,
} from '@/app/components/preferenciasAlimentarias';

/**
 * Selector de preferencias alimenticias.
 *
 * No filtra recetas: lo que hace es decidir qué ingrediente sale como
 * PRINCIPAL dentro de una receta. Si el cliente marca «vegano», la línea
 * «250 g de leche desnatada (o bebida de avena 0%)» pasa a encabezarse con la
 * bebida de avena y la leche baja al desplegable de sustituciones. Filtrar
 * recetas es cosa de los iconos del libro (los filtros de arriba).
 */
export default function PreferenciasChips({ compacto = false }) {
  const { preferencias, listas, alternar } = usePreferenciasAlimentarias();

  return (
    <div className={compacto ? '' : 'bg-white rounded-3xl p-5 border border-slate-100 shadow-sm'}>
      <div className="flex items-center gap-2 mb-1">
        <Leaf className="w-4 h-4 text-[#FF690B]" />
        <h3 className="text-[#363C98] font-bold text-sm">Mis preferencias</h3>
      </div>
      <p className="text-slate-400 text-xs mb-3">
        Los ingredientes que encajen contigo salen como principales; el resto,
        en «sustituciones».
      </p>
      <div className="flex flex-wrap gap-2">
        {PREFERENCIAS.map((p) => {
          const activa = listas && preferencias.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => alternar(p.id)}
              aria-pressed={activa}
              title={p.hint}
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold border transition-colors cursor-pointer ${
                activa
                  ? 'bg-[#FF690B] border-[#FF690B] text-white'
                  : 'bg-white border-slate-200 text-[#3932C0] hover:border-[#FF690B]'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
