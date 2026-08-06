'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Replace } from 'lucide-react';
import { usePreferenciasAlimentarias } from '@/app/components/preferenciasAlimentarias';
import {
  analizarIngrediente,
  bloquesDeIngredientes,
  conPreferencias,
} from '@/app/components/recetarioIngredientes';

// «Para el macerado» → «Para el macerado:» (el libro los imprime con dos
// puntos; algunos ya vienen con ellos y no se duplican).
function conDosPuntos(titulo) {
  const t = String(titulo).trim();
  return /[:.]$/.test(t) ? t : `${t}:`;
}

function Linea({ ingrediente, preferencias }) {
  const [abierto, setAbierto] = useState(false);
  const analisis = useMemo(() => analizarIngrediente(ingrediente.title), [ingrediente.title]);
  const { principal, promocionada, alternativas } = useMemo(
    () => conPreferencias(analisis, preferencias),
    [analisis, preferencias],
  );

  return (
    <li className="flex items-start gap-3 text-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF690B] shrink-0 mt-2.5" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold">{principal}</span>
        {promocionada && (
          <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#FFF6F0] text-[#FF690B] px-2 py-0.5">
            Tu preferencia
          </span>
        )}

        {alternativas.length > 0 && (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setAbierto((a) => !a)}
              aria-expanded={abierto}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3932C0]/60 hover:text-[#FF690B] transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`}
              />
              {`${abierto ? 'ocultar' : 'mostrar'} ${
                alternativas.length === 1 ? 'sustitución' : `${alternativas.length} sustituciones`
              }`}
            </button>
            {abierto && (
              <ul className="mt-1.5 space-y-1 border-l-2 border-slate-100 pl-3">
                {alternativas.map((alternativa, i) => (
                  <li key={i} className="text-sm text-slate-400">
                    {alternativa.original ? (
                      <>
                        <span className="text-slate-300 mr-1">en el libro:</span>
                        {alternativa.texto}
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300 mr-1">o</span>
                        {alternativa.texto}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Ingredientes con la anatomía del libro:
 *
 *  · SUBTÍTULOS DE BLOQUE en negrita («Para el macerado:», «Para el rebozado:»)
 *    encima de su grupo, una sola vez. Antes se colgaba de cada línea con un
 *    guion —«2 huevos batidos — Para el rebozado»— y una receta con tres
 *    bloques repetía la coletilla diez veces.
 *  · Las SUSTITUCIONES salen del texto de la línea al desplegable; las
 *    aclaraciones de cantidad se quedan donde estaban (ver
 *    recetarioIngredientes.js para cómo se distinguen).
 *  · Con preferencias marcadas, la opción que encaja sube a principal.
 */
export default function ListaIngredientes({ ingredientes }) {
  // `claves` = dietas + alérgenos del cliente, que es lo que el motor de
  // sustituciones sabe casar (ver recetarioIngredientes.js).
  const { claves } = usePreferenciasAlimentarias();
  const bloques = useMemo(() => bloquesDeIngredientes(ingredientes), [ingredientes]);

  return (
    <div className="space-y-5">
      {bloques.map((bloque, i) => (
        <div key={`${bloque.titulo || 'sin-bloque'}-${i}`}>
          {bloque.titulo && (
            /* En el libro estos subtítulos («Para la spicy:», «Para la
               urban:») pesan tanto como el nombre de la sección; a text-sm
               se perdían entre los ingredientes y había que buscarlos. */
            <h3 className="text-[#363C98] font-bold text-base sm:text-lg mb-2.5 pb-1.5 border-b border-slate-100">
              {conDosPuntos(bloque.titulo)}
            </h3>
          )}
          <ul className="space-y-2.5">
            {bloque.items.map((ingrediente) => (
              <Linea key={ingrediente.id} ingrediente={ingrediente} preferencias={claves} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Aviso de que las preferencias están cambiando lo que se ve. */
export function AvisoPreferencias() {
  const { claves } = usePreferenciasAlimentarias();
  if (!claves.length) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF690B] mb-3">
      <Replace className="w-3.5 h-3.5" /> Ajustado a tus preferencias
    </p>
  );
}
