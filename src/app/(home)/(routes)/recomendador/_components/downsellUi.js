'use client';

// Piezas de interfaz compartidas entre el quiz público (/recomendador) y el
// generador interno (/recomendador/interno). El motor y el copy viven en
// components/downsellEngine.js; aquí solo hay presentación.

import React, { useEffect, useState } from 'react';
import LandingButton from '../../../../components/LandingButton';
import { AREAS, OBJETIVOS, PRODUCTOS } from '../../../../components/downsellEngine';
import { fetchTieredGroup, formatEuros, TIER_META, groupTierOrder } from '../../../../components/courseCatalog';

// ---------------------------------------------------------------- Objetivo --
export function ObjetivoPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.values(OBJETIVOS).map((o) => {
        const activo = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`rounded-3xl border-2 px-6 py-5 text-lg font-bold transition-all cursor-pointer
              ${activo
                ? 'border-[#FF690B] bg-[#FFEDE0] text-[#FF690B] shadow-lg shadow-[#FF690B]/20'
                : 'border-gray-200 bg-white text-[#363C98] hover:border-[#363C98]/40'}`}
          >
            {o.key === 'PG' ? '🔥' : '💪'} {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------ Puntuaciones --
// Fila de 0 a 10 por área. Botones grandes: en el chat el lead contesta con un
// número, aquí lo toca. 8+ se tiñe de naranja para insinuar el umbral.
export function ScoreRow({ area, value, onChange }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      <p className="font-bold text-[#363C98] mb-1">
        {area.letra}) {area.pregunta}
      </p>
      <p className="text-sm text-gray-500 mb-3">
        0 = no me hace falta · 10 = lo necesito muchísimo
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, n) => {
          const activo = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${area.nombre}: ${n}`}
              onClick={() => onChange(n)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition-all cursor-pointer
                ${activo
                  ? n >= 8
                    ? 'bg-[#FF690B] text-white scale-110 shadow-md'
                    : 'bg-[#363C98] text-white scale-110 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#E7E6FF] hover:text-[#363C98]'}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ScoresForm({ scores, setScores }) {
  return (
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
  );
}

// ------------------------------------------------------------- Producto ----
// Tarjeta de producto recomendado con el precio VIGENTE: los tramos se piden al
// catálogo real (con espejo local de respaldo, igual que la tienda); las
// videoconsultas llevan precio fijo de la lista de precios.
export function ProductoCard({ productoId }) {
  const meta = PRODUCTOS[productoId];
  const [group, setGroup] = useState(null);

  useEffect(() => {
    let vivo = true;
    if (meta?.catalogBase) {
      fetchTieredGroup(meta.catalogBase)
        .then((g) => vivo && setGroup(g))
        .catch(() => {});
    }
    return () => { vivo = false; };
  }, [meta?.catalogBase]);

  if (!meta) return null;

  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-md p-6 flex flex-col gap-3">
      <p className="text-lg font-extrabold text-[#363C98]">{meta.nombre}</p>

      {meta.catalogBase ? (
        group ? (
          <ul className="text-sm text-gray-600 space-y-1">
            {groupTierOrder(group).map((tier) => (
              <li key={tier} className="flex items-baseline justify-between gap-3">
                <span>{TIER_META[tier].label}</span>
                <span className="font-bold text-[#363C98] whitespace-nowrap">
                  {formatEuros(group.tiers[tier].price)} {TIER_META[tier].priceSuffix}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Cargando precios…</p>
        )
      ) : (
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#363C98] text-base">{formatEuros(meta.precio)} €</span>
          {meta.precioAntes ? (
            <span className="ml-2 line-through text-gray-400">{formatEuros(meta.precioAntes)} €</span>
          ) : null}
          {meta.nota ? <span className="block mt-0.5">{meta.nota}</span> : null}
        </p>
      )}

      <div className="mt-auto pt-2">
        <LandingButton variant="orange" href={meta.href}>
          {meta.cta}
        </LandingButton>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- Resultado ---
// El copy aprobado, en burbujas tipo chat (es literalmente lo que María diría
// por mensaje), seguido de las tarjetas de producto.
export function Resultado({ combo }) {
  if (!combo) return null;
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {combo.bloques.map((b, i) => (
          <p
            key={i}
            className="rounded-3xl rounded-tl-md bg-[#EDF0FC] text-[#1f2461] px-5 py-4 leading-relaxed"
          >
            {b}
          </p>
        ))}
      </div>
      <div className={`grid gap-4 ${combo.productos.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {combo.productos.map((p) => (
          <ProductoCard key={p} productoId={p} />
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Todas las compras tienen garantía de 30 días.
      </p>
    </div>
  );
}

// Botón "copiar al portapapeles" con confirmación breve (uso interno).
export function CopyButton({ text, label = 'Copiar' }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        });
      }}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors cursor-pointer
        ${ok ? 'bg-green-100 text-green-700' : 'bg-[#363C98] text-white hover:bg-[#2a2f7a]'}`}
    >
      {ok ? '✓ Copiado' : label}
    </button>
  );
}
