'use client';

// El logo de la portada y su salida: un portal que se lo traga.
//
// Cómo funciona, que no es lo obvio:
//
// 1. El logo NO se fragmenta. Partirlo en cuadraditos dejaba «migas» que se
//    veían baratas. En su lugar gira, encoge, se desenfoca y una MÁSCARA
//    RADIAL se lo va comiendo desde los bordes hacia el centro: eso es
//    disolverse, no romperse.
// 2. Los hilos del portal son espirales logarítmicas dibujadas con curvas de
//    Bézier, no arcos rotados: son curvas por construcción. Se «dibujan» hacia
//    dentro animando `stroke-dashoffset`, que es lo que da la sensación de
//    flujo.
// 3. Antes de irse hay un rebote corto (agranda y encoge rápido) que hace de
//    señal de que la cosa arranca.

import React, { useEffect, useMemo, useRef } from 'react';

const COLORES = ['#363C98', '#FF690B', '#5A61C4', '#FF8F45', '#8E93DC', '#FFB37A'];
/** Radio del portal en px. 50 es el que eligió María. */
const RADIO = 50;
const HILOS = 40;

/** Duración total de la salida. Tiene que cuadrar con PORTADA_OUT_MS. */
export const PORTAL_MS = 1200;

/** Espiral logarítmica como path de Bézier: curva de verdad, no arcos. */
function espiral(i) {
  const a0 = (i * 2.399) % (Math.PI * 2); // ángulo áureo: reparto sin repetir
  const r0 = RADIO * (0.55 + ((i * 37) % 75) / 100);
  const vueltas = 1.1 + ((i * 53) % 90) / 100;
  const pts = [];
  for (let s = 0; s <= 22; s += 1) {
    const t = s / 22;
    const ang = a0 + t * vueltas * Math.PI * 2;
    const r = r0 * (1 - t) ** 1.25;
    pts.push([Math.cos(ang) * r, Math.sin(ang) * r * 0.92]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let j = 1; j < pts.length - 1; j += 1) {
    const mx = (pts[j][0] + pts[j + 1][0]) / 2;
    const my = (pts[j][1] + pts[j + 1][1]) / 2;
    d += ` Q${pts[j][0].toFixed(1)},${pts[j][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  return d;
}

export default function LogoEspagueti({ tamano = 120, saliendo = false, className = '' }) {
  const logoRef = useRef(null);
  const rafRef = useRef(0);

  const hilos = useMemo(
    () =>
      Array.from({ length: HILOS }, (_, i) => ({
        d: espiral(i),
        color: COLORES[i % COLORES.length],
        ancho: (1.2 + ((i * 29) % 26) / 10).toFixed(1),
        giro: 160 + ((i * 43) % 120),
        retardo: i * 16,
      })),
    [],
  );

  // La máscara no se puede animar por CSS (no interpola gradientes), así que
  // se mueve a mano con requestAnimationFrame.
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return undefined;
    if (!saliendo) {
      el.style.webkitMaskImage = '';
      el.style.maskImage = '';
      return undefined;
    }
    const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (sinMovimiento) return undefined;

    const t0 = performance.now();
    const paso = (ahora) => {
      const p = Math.min(1, (ahora - t0) / (PORTAL_MS * 0.93));
      const borde = 100 - p * p * 100;
      const m = `radial-gradient(circle at 50% 50%, #000 0%, #000 ${Math.max(0, borde - 18)}%, transparent ${Math.max(1, borde)}%)`;
      el.style.webkitMaskImage = m;
      el.style.maskImage = m;
      if (p < 1) rafRef.current = requestAnimationFrame(paso);
    };
    rafRef.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(rafRef.current);
  }, [saliendo]);

  const lado = tamano * 2.6; // el lienzo del portal, más ancho que el logo

  return (
    <div
      className={`relative grid place-items-center shrink-0 ${className}`}
      style={{ width: lado, height: lado }}
      role="img"
      aria-label="Squad Fit"
    >
      <svg
        className="absolute pointer-events-none overflow-visible"
        style={{ width: lado, height: lado }}
        viewBox={`${-lado / 2} ${-lado / 2} ${lado} ${lado}`}
        aria-hidden="true"
      >
        {hilos.map((h, i) => (
          <path
            key={i}
            d={h.d}
            fill="none"
            stroke={h.color}
            strokeWidth={h.ancho}
            strokeLinecap="round"
            strokeDasharray="140 1000"
            strokeDashoffset={140}
            opacity={0}
            className={saliendo ? 'sf-hilo' : undefined}
            style={saliendo ? { animationDelay: `${h.retardo}ms`, '--giro': `${h.giro}deg` } : undefined}
          />
        ))}
      </svg>
      <img
        ref={logoRef}
        src="/LogotipoSquatfit-512.png"
        alt=""
        aria-hidden="true"
        width={tamano}
        height={tamano}
        className={saliendo ? 'sf-logo-portal' : undefined}
        style={{ width: tamano, height: tamano }}
      />
    </div>
  );
}
