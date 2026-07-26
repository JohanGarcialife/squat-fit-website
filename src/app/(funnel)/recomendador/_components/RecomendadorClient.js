'use client';

// Quiz público del downsell (pantalla completa, sin menú ni pie: es un paso de
// venta). El lead elige objetivo, puntúa las 4 áreas del 1 al 5 y pasa por la
// secuencia: «Calculando tu mejor opción…» → «¡Perfecto, ya lo tenemos!» →
// resumen que se escribe en vivo → tarjetas de producto.
//
// También funciona como página de destino directa: el generador interno (back
// office) crea enlaces /recomendador?c=1100&o=GM&via=karl que saltan el quiz
// pero conservan la secuencia animada (el efecto es parte de la venta).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AREAS,
  OBJETIVOS,
  findCombo,
  resolve,
  resumenCorto,
} from '@/app/components/downsellEngine';
import {
  CalculandoOverlay,
  ObjetivoPicker,
  ProductoCard,
  ScoreRow,
  Typewriter,
} from './downsellUi';

const SCORES_VACIOS = Object.fromEntries(AREAS.map((a) => [a.key, null]));

// La escala pública es 1-5; el motor trabaja en 0-10 con umbral 8. ×2 hace que
// el 4 público equivalga exactamente al 8 del chat (misma frontera).
const ESCALA = 10 / 5;

export default function RecomendadorClient() {
  const params = useSearchParams();

  // Enlace directo del equipo: ?c=<clave>&o=<PG|GM> salta el quiz.
  const directo = useMemo(() => {
    const c = params.get('c');
    const o = (params.get('o') || '').toUpperCase();
    if (c && OBJETIVOS[o]) return findCombo(c, o);
    return null;
  }, [params]);

  const [objetivo, setObjetivo] = useState(null);
  const [scores, setScores] = useState(SCORES_VACIOS);
  const [combo, setCombo] = useState(null);
  // fase: quiz → calculando → listo → resultado
  const [fase, setFase] = useState(directo ? 'calculando' : 'quiz');
  const [textoListo, setTextoListo] = useState(false);
  const timersRef = useRef([]);

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

  // Secuencia animada: 1,8 s de cálculo + 1,1 s de check → resultado.
  const lanzarSecuencia = (comboElegido) => {
    setCombo(comboElegido);
    setTextoListo(false);
    setFase('calculando');
    timersRef.current.push(
      setTimeout(() => setFase('listo'), 1800),
      setTimeout(() => setFase('resultado'), 2900),
    );
  };

  // Enlace directo: arranca la secuencia al montar.
  useEffect(() => {
    if (directo) lanzarSecuencia(directo);
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directo]);

  // Evento GA4 cuando el resultado queda a la vista.
  useEffect(() => {
    if (fase === 'resultado' && combo && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'downsell_result', {
        clave: combo.clave,
        objetivo: combo.objetivo,
        via: params.get('via') || 'organico',
      });
    }
  }, [fase, combo, params]);

  const todasPuntuadas = AREAS.every((a) => scores[a.key] !== null);

  const enviar = () => {
    const escalados = Object.fromEntries(
      AREAS.map((a) => [a.key, scores[a.key] * ESCALA]),
    );
    const r = resolve(escalados, objetivo);
    if (r) lanzarSecuencia(r);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FC]">
      <CalculandoOverlay
        fase={fase === 'calculando' ? 'calculando' : fase === 'listo' ? 'listo' : null}
      />

      {fase === 'quiz' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <header className="mb-10 text-center">
            <p className="text-sm font-extrabold tracking-widest text-[#FF690B] uppercase mb-2">
              Squad Fit
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#363C98]">
              ¿Qué te encaja mejor ahora mismo?
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Puntúa del 1 al 5 cuánta falta te hace profundizar en cada área y
              te digo qué te recomiendo, con la misma lógica que uso en mis
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
            <div className="space-y-4">
              {AREAS.map((a) => (
                <ScoreRow
                  key={a.key}
                  area={a}
                  value={scores[a.key]}
                  onChange={(n) => setScores((s) => ({ ...s, [a.key]: n }))}
                />
              ))}
            </div>
          </section>

          <div className="text-center pb-8">
            <button
              type="button"
              disabled={!objetivo || !todasPuntuadas}
              onClick={enviar}
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
        </div>
      )}

      {fase === 'resultado' && combo && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <header className="mb-8 text-center">
            <p className="text-sm font-extrabold tracking-widest text-[#FF690B] uppercase mb-2">
              Squad Fit
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#363C98]">
              Mi recomendación para ti
            </h1>
          </header>

          <div className="rounded-3xl bg-white border border-gray-100 shadow-md px-6 py-7 sm:px-8 mb-8 min-h-28">
            <Typewriter texto={resumenCorto(combo)} onDone={() => setTextoListo(true)} />
          </div>

          <div
            className={`transition-all duration-700 ${textoListo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <div className={`grid gap-4 ${combo.productos.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm sm:mx-auto'}`}>
              {combo.productos.map((p) => (
                <ProductoCard key={p} productoId={p} />
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Todas las compras tienen garantía de 30 días.
            </p>
            {!directo && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCombo(null);
                    setScores(SCORES_VACIOS);
                    setFase('quiz');
                  }}
                  className="text-sm font-bold text-[#363C98] underline underline-offset-4 cursor-pointer"
                >
                  Volver a puntuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
