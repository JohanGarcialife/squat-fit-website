'use client';

// Generador interno del downsell — sustituye a la hoja "Generador Downsell
// Squad Fit.xlsx". El equipo (o ZeroChats) puntúa lo que contestó el lead y
// obtiene: el párrafo para pegar en el chat, el enlace con la atribución de
// quien lo envía (utm_source) y la nota interna del audio.
//
// No se crean enlaces cortos por vendedor: el enlace lleva la combinación y la
// etiqueta dentro (?c=..&o=..&via=..). Añadir un vendedor nuevo es una línea
// en VENDEDORES (downsellEngine.js).

import React, { useMemo, useState } from 'react';
import {
  AREAS,
  INTRO_CHAT,
  OBJETIVOS,
  PRODUCTOS,
  VENDEDORES,
  buildResultUrl,
  parrafoChat,
  resolve,
} from '../../../../../components/downsellEngine';
import { ObjetivoPicker, ScoresForm, CopyButton, ProductoCard } from '../../_components/downsellUi';

const SCORES_VACIOS = Object.fromEntries(AREAS.map((a) => [a.key, null]));

export default function InternoClient() {
  const [via, setVia] = useState(VENDEDORES[0].key);
  const [objetivo, setObjetivo] = useState('PG');
  const [scores, setScores] = useState(SCORES_VACIOS);

  const listo = objetivo && AREAS.every((a) => scores[a.key] !== null);
  const combo = useMemo(
    () => (listo ? resolve(scores, objetivo) : null),
    [listo, scores, objetivo],
  );

  const enlace = combo
    ? buildResultUrl({ clave: combo.clave, objetivo: combo.objetivo, via })
    : '';
  const parrafo = combo ? parrafoChat(combo) : '';

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FF690B]">
          Uso interno · no compartir esta página
        </p>
        <h1 className="text-3xl font-extrabold text-[#363C98] mt-1">
          Generador de downsell
        </h1>
        <p className="mt-2 text-gray-600">
          Puntúa lo que contestó el lead y copia el párrafo + el enlace ya
          etiquetado. El copy de apertura del chat, por si lo necesitas:
        </p>
        <div className="mt-3 flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-sm text-gray-600 flex-1">{INTRO_CHAT}</p>
          <CopyButton text={INTRO_CHAT} label="Copiar intro" />
        </div>
      </header>

      <section className="mb-6">
        <h2 className="font-extrabold text-[#363C98] mb-2">¿Quién lo envía?</h2>
        <div className="flex gap-3">
          {VENDEDORES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVia(v.key)}
              className={`rounded-2xl px-5 py-2.5 font-bold transition-all cursor-pointer
                ${via === v.key
                  ? 'bg-[#363C98] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#E7E6FF] hover:text-[#363C98]'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-extrabold text-[#363C98] mb-2">Objetivo del lead</h2>
        <ObjetivoPicker value={objetivo} onChange={setObjetivo} />
      </section>

      <section className="mb-8">
        <h2 className="font-extrabold text-[#363C98] mb-2">
          Puntuaciones del lead (0-10 · 8+ cuenta como necesidad)
        </h2>
        <ScoresForm scores={scores} setScores={setScores} />
      </section>

      {combo && (
        <section className="space-y-6">
          <div className="rounded-3xl border-2 border-[#FF690B]/30 bg-[#FFF8F3] p-6 space-y-4">
            <p className="font-extrabold text-[#363C98]">
              Hilo {combo.hilo} · {combo.necesidades}
              {combo.fallback ? ' · (sin 8+: usa la más alta)' : ''}
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  🔗 Enlace para el lead ({via})
                </p>
                <CopyButton text={enlace} label="Copiar enlace" />
              </div>
              <p className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm break-all font-mono">
                {enlace}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  📋 Párrafo para el chat
                </p>
                <CopyButton text={parrafo} label="Copiar párrafo" />
              </div>
              <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                {parrafo}
              </div>
            </div>

            <p className="rounded-xl bg-[#E7E6FF] text-[#363C98] px-4 py-3 text-sm">
              📝 {combo.notaInterna}
            </p>
          </div>

          <div>
            <p className="font-extrabold text-[#363C98] mb-3">
              Precios vigentes de lo recomendado
            </p>
            <div className={`grid gap-4 ${combo.productos.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
              {combo.productos.map((p) => (
                <ProductoCard key={p} productoId={p} />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {combo.productos.map((p) => PRODUCTOS[p].nombre).join(' + ')} · precios del catálogo real
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
