'use client';

import React from 'react';
import { Check } from 'lucide-react';

/**
 * La casilla de verificación del carrito. Una sola, para todas.
 *
 * ── Por qué no la nativa ────────────────────────────────────────────────────
 *
 * `<input type="checkbox">` con `accent-color` se pinta distinto en cada
 * sistema: en macOS sale con las esquinas casi rectas y la marca en negro, y no
 * hay forma de cambiarlo. En el carrito convivía con la casilla dibujada a mano
 * de «usar la misma dirección», que era un círculo naranja, así que la misma
 * pantalla tenía dos casillas con dos formas y dos colores. Es exactamente el
 * tipo de detalle que hace que una pasarela de pago parezca montada a trozos.
 *
 * Esta es cuadrada con las esquinas redondeadas, blanca cuando está sin marcar
 * y naranja de marca cuando lo está. El `input` real sigue existiendo debajo
 * (`sr-only`): así funciona el tabulador, la barra espaciadora, el `htmlFor` de
 * la etiqueta y el lector de pantalla. Dibujar la casilla no es excusa para
 * romper el teclado.
 *
 * ── Alineación ──────────────────────────────────────────────────────────────
 *
 * La casilla se centra con la PRIMERA LÍNEA del texto, no con el bloque entero.
 * Con `items-start` a secas, un texto de dos líneas dejaba la casilla arriba y
 * el rótulo visiblemente caído. `items-center` en el contenedor de la casilla,
 * con la misma altura de línea que el texto, las deja a la misma altura sin
 * depender de cuántas líneas ocupe la explicación.
 */
export default function Casilla({
  checked,
  onChange,
  id,
  children,
  className = '',
  /** Recuadro con fondo, para cuando la casilla es una oferta y no un ajuste. */
  destacada = false,
}) {
  return (
    <label
      htmlFor={id}
      className={`flex gap-3 cursor-pointer select-none group ${
        destacada
          ? `rounded-2xl border p-4 transition-all ${
              checked
                ? 'border-orange-300 bg-orange-50/70'
                : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
            }`
          : ''
      } ${className}`}
    >
      {/* `h-6` = la altura de línea del texto: es lo que centra la casilla con
          la primera línea y no con el párrafo entero. */}
      <span className="flex h-6 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all
            peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/25
            ${checked
              ? 'border-orange-500 bg-orange-500'
              : 'border-slate-300 bg-white group-hover:border-orange-400'}`}
        >
          <Check
            size={13}
            strokeWidth={3}
            className={`text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
          />
        </span>
      </span>
      <span className="min-w-0 flex-1 leading-6">{children}</span>
    </label>
  );
}
