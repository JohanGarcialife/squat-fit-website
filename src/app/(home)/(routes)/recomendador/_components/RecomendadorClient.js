'use client';

// Quiz público del downsell: el lead puntúa sus 4 necesidades y su objetivo y
// aterriza en la recomendación con el copy aprobado y los productos vigentes.
//
// También funciona como página de destino directa: el generador interno crea
// enlaces /recomendador?c=1100&o=GM&via=karl que saltan directo al resultado
// (el lead ya contestó por chat; no se le hace puntuar dos veces).

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AREAS,
  OBJETIVOS,
  findCombo,
  resolve,
} from '../../../../components/downsellEngine';
import { ObjetivoPicker, ScoresForm, Resultado } from './downsellUi';

const SCORES_VACIOS = Object.fromEntries(AREAS.map((a) => [a.key, null]));

export default function RecomendadorClient() {
  const params = useSearchParams();

  // Enlace directo del equipo: ?c=<clave>&o=<PG|GM> pinta el resultado sin quiz.
  const directo = useMemo(() => {
    const c = params.get('c');
    const o = (params.get('o') || '').toUpperCase();
    if (c && OBJETIVOS[o]) return findCombo(c, o);
    return null;
  }, [params]);

  const [objetivo, setObjetivo] = useState(null);
  const [scores, setScores] = useState(SCORES_VACIOS);
  const [resultado, setResultado] = useState(null);

  const combo = directo || resultado;

  // Atribución: si el enlace trae ?via= (karl / zerochats), se guarda en local
  // para que la venta pueda ligarse a quien lo envió aunque el lead navegue.
  useEffect(() => {
    const via = params.get('via');
    if (via) {
      try {
        localStorage.setItem('sqf_attrib', JSON.stringify({ via, ts: Date.now() }));
      } catch {}
    }
  }, [params]);

  // Evento GA4 cada vez que se muestra una recomendación.
  useEffect(() => {
    if (combo && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'downsell_result', {
        clave: combo.clave,
        objetivo: combo.objetivo,
        via: params.get('via') || 'organico',
      });
    }
  }, [combo, params]);

  const todasPuntuadas = AREAS.every((a) => scores[a.key] !== null);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {!combo && (
        <>
          <header className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#363C98]">
              ¿Qué te encaja mejor ahora mismo?
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Puntúa del 0 al 10 cuánta falta te hace profundizar en cada área
              y te digo qué te recomiendo, con la misma lógica que uso en mis
              asesorías.
            </p>
          </header>

          <section className="mb-8">
            <h2 className="font-extrabold text-[#363C98] text-lg mb-3">1 · Tu objetivo</h2>
            <ObjetivoPicker value={objetivo} onChange={setObjetivo} />
          </section>

          <section className="mb-8">
            <h2 className="font-extrabold text-[#363C98] text-lg mb-3">
              2 · ¿Cuánta falta te hace cada cosa?
            </h2>
            <ScoresForm scores={scores} setScores={setScores} />
          </section>

          <div className="text-center">
            <button
              type="button"
              disabled={!objetivo || !todasPuntuadas}
              onClick={() => setResultado(resolve(scores, objetivo))}
              className="rounded-[27px] bg-[#FF690B] px-10 py-4 text-lg font-bold text-white shadow-lg
                         transition-all hover:scale-[1.03] active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              Ver mi recomendación
            </button>
            {!todasPuntuadas && (
              <p className="mt-2 text-sm text-gray-400">
                Puntúa las cuatro áreas para continuar
              </p>
            )}
          </div>
        </>
      )}

      {combo && (
        <>
          <header className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#363C98]">
              Mi recomendación para ti
            </h1>
            {combo.fallback && (
              <p className="mt-2 text-sm text-gray-500">
                Ninguna área llegó a 8, así que parto de la que más puntuaste.
              </p>
            )}
          </header>
          <Resultado combo={combo} />
          {!directo && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setScores(SCORES_VACIOS);
                }}
                className="text-sm font-bold text-[#363C98] underline underline-offset-4 cursor-pointer"
              >
                Volver a puntuar
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
