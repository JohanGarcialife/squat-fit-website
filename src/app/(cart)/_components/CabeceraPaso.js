'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * La cabecera de los tres pasos del carrito. Una sola, para que se comporten
 * igual.
 *
 * ── Por qué en una línea ────────────────────────────────────────────────────
 *
 * Antes eran dos: «Paso 1 de 3» arriba y debajo un titular de 36-40px con la
 * flecha al lado. Eso son ~110px de alto fijos en la pantalla donde se compra,
 * y en un móvil con el teclado abierto se comían una parte seria de lo que
 * quedaba. Ahora el paso va a la izquierda y el titular a la derecha, en la
 * misma fila.
 *
 * ── Por qué el titular es más pequeño ───────────────────────────────────────
 *
 * Un `text-4xl` pegado arriba mientras se hace scroll tapa contenido y grita
 * más que el propio pedido. En una cabecera fija el título no es el
 * protagonista: es una referencia de dónde estás. `text-xl` cumple eso y deja
 * respirar al formulario.
 *
 * ── La flecha ───────────────────────────────────────────────────────────────
 *
 * Va en un botón redondo con área táctil real (40px), no un chevron suelto de
 * 28px flotando junto al texto. Un icono sin superficie no parece pulsable, y
 * en móvil es el control que más se falla.
 */
export default function CabeceraPaso({ paso, titulo, onAtras, atrasHref, aria = 'Atrás' }) {
  const Flecha = (
    <>
      <ArrowLeft size={18} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span className="sr-only">{aria}</span>
    </>
  );

  return (
    // `sticky top-0` en TODOS los tamaños: en escritorio la columna del
    // formulario también es larga y saber en qué paso vas no es solo un
    // problema de móvil. El `-mx` + `px` compensa el padding del contenedor
    // para que el fondo blanco llegue de borde a borde al quedarse pegada.
    <div className="sticky top-0 z-30 -mx-6 mb-8 border-b border-slate-100 bg-white/95 px-6 py-3 backdrop-blur lg:-mx-14 lg:px-14">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {atrasHref ? (
            <a
              href={atrasHref}
              aria-label={aria}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-indigo-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95"
            >
              {Flecha}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAtras}
              aria-label={aria}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-indigo-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 cursor-pointer"
            >
              {Flecha}
            </button>
          )}
          <span className="truncate text-sm font-semibold text-indigo-900/60">{paso}</span>
        </div>

        <h1 className="truncate text-xl font-bold text-indigo-900 sm:text-2xl">{titulo}</h1>
      </div>
    </div>
  );
}
