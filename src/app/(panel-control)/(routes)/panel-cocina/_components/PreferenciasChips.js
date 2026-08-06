'use client';

import { useState } from 'react';
import { ChevronDown, Leaf } from 'lucide-react';
import {
  ALERGENOS,
  DIETAS,
  usePreferenciasAlimentarias,
} from '@/app/components/preferenciasAlimentarias';

function Pastilla({ activa, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`rounded-full px-3.5 py-1.5 text-sm font-bold border transition-colors cursor-pointer ${
        activa
          ? 'bg-[#FF690B] border-[#FF690B] text-white'
          : 'bg-white border-slate-200 text-[#3932C0] hover:border-[#FF690B]'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Selector de preferencias alimenticias: dietas y alérgenos.
 *
 * No filtra recetas: lo que hace es decidir qué ingrediente sale como
 * PRINCIPAL dentro de una receta. Si el cliente marca «vegana», la línea
 * «250 g de leche desnatada (o bebida de avena 0%)» pasa a encabezarse con la
 * bebida de avena y la leche baja al desplegable de sustituciones. Filtrar
 * recetas es cosa de los iconos del libro (los filtros de arriba).
 *
 * Los alérgenos van plegados: son catorce y la mayoría de la gente no marca
 * ninguno, así que no deben tapar las dietas, que es lo que sí se toca.
 */
export default function PreferenciasChips({ compacto = false }) {
  const { dietas, alergenos, listas, alternar } = usePreferenciasAlimentarias();
  const [alergenosAbiertos, setAlergenosAbiertos] = useState(false);

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
        {DIETAS.map((d) => (
          <Pastilla
            key={d.id}
            activa={listas && dietas.includes(d.id)}
            onClick={() => alternar('dietas', d.id)}
          >
            {d.label}
          </Pastilla>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAlergenosAbiertos((a) => !a)}
        aria-expanded={alergenosAbiertos}
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#3932C0]/60 hover:text-[#FF690B] transition-colors cursor-pointer"
      >
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${alergenosAbiertos ? 'rotate-180' : ''}`}
        />
        Alérgenos que evito
        {listas && alergenos.length > 0 && (
          <span className="ml-1 rounded-full bg-[#FFF6F0] text-[#FF690B] px-2 py-0.5">
            {alergenos.length}
          </span>
        )}
      </button>

      {alergenosAbiertos && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ALERGENOS.map((a) => (
            <Pastilla
              key={a.id}
              activa={listas && alergenos.includes(a.id)}
              onClick={() => alternar('alergenos', a.id)}
            >
              Sin {a.label.toLowerCase()}
            </Pastilla>
          ))}
        </div>
      )}
    </div>
  );
}
