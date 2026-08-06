'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import {
  ALERGENOS,
  DIETAS,
  usePreferenciasAlimentarias,
} from '@/app/components/preferenciasAlimentarias';

/**
 * Pantalla de bienvenida al recetario: la PRIMERA vez que se entra y no hay
 * ninguna preferencia elegida, se pregunta antes de enseñar nada.
 *
 * Sale una sola vez: en cuanto el cliente toca algo —o dice que no tiene
 * ninguna— queda marcado como elegido y no vuelve a aparecer. Ese «no tengo
 * ninguna» no es opcional: sin él, quien come de todo se encontraría una
 * aduana en cada visita. Después se cambian desde «Mis preferencias», en la
 * propia lista y dentro de cada receta.
 */
export default function BienvenidaPreferencias() {
  const { dietas, alergenos, elegido, listas, alternar, confirmar, marcarSinPreferencias } =
    usePreferenciasAlimentarias();
  const [alergenosAbiertos, setAlergenosAbiertos] = useState(false);
  // `null` = todavía no se sabe (falta leer el almacenamiento). Se decide UNA
  // vez: marcar la primera dieta ya deja el perfil como elegido, y si la
  // visibilidad dependiera de eso en vivo, la pantalla se cerraría sola en
  // cuanto el cliente tocara la primera pastilla.
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    if (!listas) return;
    setAbierta((previa) => (previa === null ? !elegido : previa));
  }, [listas, elegido]);

  const visible = abierta === true;

  // Mientras está delante, el fondo no se mueve.
  useEffect(() => {
    if (!visible) return undefined;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [visible]);

  if (!visible) return null;

  const algunaMarcada = dietas.length > 0 || alergenos.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[#3932C0]/25 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full bg-[#FFF6F0] text-[#FF690B] px-3 py-1">
          <Sparkles className="w-3.5 h-3.5" /> Antes de empezar
        </span>

        <h2 className="text-[#3932C0] text-2xl sm:text-3xl font-bold mt-4 leading-tight">
          ¿Cómo comes tú?
        </h2>
        <p className="text-slate-500 mt-2 leading-relaxed">
          Dinos qué sigues y qué evitas, y en cada receta te pondremos por
          delante el ingrediente que te encaja: el resto se queda a un clic, en
          «sustituciones». Puedes cambiarlo cuando quieras.
        </p>

        <h3 className="text-[#363C98] font-bold text-sm mt-6 mb-2.5">Mi alimentación</h3>
        <div className="flex flex-wrap gap-2">
          {DIETAS.map((d) => {
            const activa = dietas.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => alternar('dietas', d.id)}
                aria-pressed={activa}
                className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors cursor-pointer ${
                  activa
                    ? 'bg-[#FF690B] border-[#FF690B] text-white'
                    : 'bg-white border-slate-200 text-[#3932C0] hover:border-[#FF690B]'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAlergenosAbiertos((a) => !a)}
          aria-expanded={alergenosAbiertos}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#3932C0]/70 hover:text-[#FF690B] transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${alergenosAbiertos ? 'rotate-180' : ''}`}
          />
          ¿Evitas algún alérgeno?
        </button>

        {alergenosAbiertos && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ALERGENOS.map((a) => {
              const activa = alergenos.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => alternar('alergenos', a.id)}
                  aria-pressed={activa}
                  className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors cursor-pointer ${
                    activa
                      ? 'bg-[#FF690B] border-[#FF690B] text-white'
                      : 'bg-white border-slate-200 text-[#3932C0] hover:border-[#FF690B]'
                  }`}
                >
                  Sin {a.label.toLowerCase()}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => {
              marcarSinPreferencias();
              setAbierta(false);
            }}
            className="text-slate-400 font-bold hover:text-[#FF690B] transition-colors cursor-pointer text-sm sm:mr-auto"
          >
            No tengo ninguna
          </button>
          <button
            type="button"
            onClick={() => {
              confirmar();
              setAbierta(false);
            }}
            disabled={!algunaMarcada}
            className={`rounded-2xl px-8 py-3 font-bold text-white transition-colors ${
              algunaMarcada
                ? 'bg-[#3932C0] hover:bg-[#3932C0]/90 cursor-pointer'
                : 'bg-slate-200 cursor-not-allowed'
            }`}
          >
            Ver mis recetas
          </button>
        </div>
      </div>
    </div>
  );
}
