'use client';

// Piezas de interfaz del quiz público del downsell. El motor y el copy viven
// en components/downsellEngine.js; aquí solo hay presentación.

import React, { useEffect, useRef, useState } from 'react';
import LandingButton from '@/app/components/LandingButton';
import { OBJETIVOS, PRODUCTOS } from '@/app/components/downsellEngine';
import {
  fetchTieredGroup,
  formatEuros,
  TIER_META,
  groupTierOrder,
} from '@/app/components/courseCatalog';

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
// El lead puntúa cada área del 1 al 5 (más amable que el 0-10 del chat).
// 4 y 5 cuentan como necesidad y se tiñen de naranja al elegirse.
export function ScoreRow({ area, value, onChange }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      <p className="font-bold text-[#363C98] mb-1">{area.pregunta}</p>
      <p className="text-sm text-gray-500 mb-3">1 = no me hace falta · 5 = lo necesito muchísimo</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const activo = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${area.nombre}: ${n}`}
              onClick={() => onChange(n)}
              className={`flex-1 h-12 rounded-2xl text-base font-bold transition-all cursor-pointer
                ${activo
                  ? n >= 4
                    ? 'bg-[#FF690B] text-white scale-105 shadow-md'
                    : 'bg-[#363C98] text-white scale-105 shadow-md'
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

// --------------------------------------------------- Overlay "calculando" --
// Secuencia de dos tiempos sobre un velo blanco: rueda con los colores de la
// marca («Calculando tu mejor opción…») y después el check de confirmación
// («¡Perfecto, ya lo tenemos!»). El padre controla la fase.
export function CalculandoOverlay({ fase }) {
  if (!fase) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center px-6">
        {fase === 'calculando' ? (
          <>
            <div
              className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#E7E6FF] border-t-[#FF690B]"
              aria-hidden
            />
            <p className="text-xl font-extrabold text-[#363C98]">
              Calculando tu mejor opción…
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-xl font-extrabold text-[#363C98]">
              ¡Perfecto, ya lo tenemos!
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------- Texto "escrito" --
// Va revelando el texto carácter a carácter, como si se escribiera en vivo.
// Respeta prefers-reduced-motion (lo muestra entero) y avisa al terminar para
// que el padre revele las tarjetas de producto.
export function Typewriter({ texto, onDone, velocidad = 24 }) {
  const [visible, setVisible] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    setVisible(0);
    if (!texto) return undefined;
    if (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(texto.length);
      doneRef.current = true;
      onDone?.();
      return undefined;
    }
    const timer = setInterval(() => {
      setVisible((v) => {
        if (v >= texto.length) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return v;
        }
        return v + 1;
      });
    }, velocidad);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const terminado = visible >= (texto?.length || 0);
  return (
    <p className="text-xl sm:text-2xl leading-relaxed text-[#1f2461] font-medium">
      {texto?.slice(0, visible)}
      {!terminado && <span className="animate-pulse text-[#FF690B]">▍</span>}
    </p>
  );
}

// ------------------------------------------------------------- Producto ----
// Tarjeta de producto recomendado con el precio VIGENTE: los tramos se piden
// al catálogo real (con espejo local de respaldo, igual que la tienda); las
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
            {/* Solo el tramo ANUAL (pago único): es el que coincide con los
                precios históricos del generador (el xlsx) y evita que el lead
                del downsell compare mensualidades. Petición de María, 27-jul. */}
            {groupTierOrder(group)
              .filter((tier) => tier === 'anual' || groupTierOrder(group).length === 1)
              .map((tier) => (
                <li key={tier} className="flex items-baseline justify-between gap-3">
                  <span>Acceso 12 meses · pago único</span>
                  <span className="font-bold text-[#363C98] whitespace-nowrap">
                    {formatEuros(group.tiers[tier].price)} €
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
        {/* La reserva de la llamada vive en TidyCal, fuera del sitio: se abre en
            pestaña nueva para no perder la recomendación —que es la que lleva
            la configuración del downsell en la URL y no se puede reconstruir—,
            y con `rel` porque el destino es de un tercero. Los demás productos
            son rutas nuestras y siguen navegando en la misma pestaña. */}
        <LandingButton
          variant="orange"
          href={meta.href}
          {...(/^https?:\/\//.test(meta.href || '')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {meta.cta}
        </LandingButton>
      </div>
    </div>
  );
}
