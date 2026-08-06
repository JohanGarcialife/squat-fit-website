'use client';

import React from 'react';

/**
 * Interruptor de encendido/apagado.
 *
 * ── Por qué NO es una casilla ───────────────────────────────────────────────
 *
 * «Usar la misma dirección para el envío» estaba a dos dedos de «Guardar esta
 * dirección», con la misma casilla cuadrada y el mismo tamaño de letra. Dos
 * controles idénticos y pegados, que hacen cosas muy distintas: uno decide a
 * dónde va el paquete y el otro solo guarda datos para la próxima vez.
 * Confundirlos manda el pedido a otra dirección.
 *
 * Un interruptor se lee distinto a primera vista: es el control de «esto está
 * activado / desactivado», no el de «marco esta opción de una lista». La forma
 * hace el trabajo que en una casilla tendría que hacer el texto.
 *
 * Sigue siendo un `input type="checkbox"` de verdad debajo (`sr-only`): el
 * teclado, la barra espaciadora y el lector de pantalla funcionan igual. Se
 * dibuja el control, no se reinventa.
 */
export default function Interruptor({ checked, onChange, id, titulo, descripcion }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 cursor-pointer select-none transition-all ${
        checked
          ? 'border-indigo-200 bg-indigo-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="min-w-0">
        <span className="block font-semibold text-indigo-900">{titulo}</span>
        {descripcion && (
          <span className="mt-0.5 block text-sm leading-snug text-slate-500">{descripcion}</span>
        )}
      </span>

      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      {/* El raíl. `shrink-0` porque con un título largo el flex lo aplastaba
          hasta dejarlo ovalado. */}
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors
          peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/25
          ${checked ? 'bg-orange-500' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </label>
  );
}
