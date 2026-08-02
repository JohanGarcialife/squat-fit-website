'use client';

import { useEffect, useRef, useState } from 'react';

// Cuenta ascendente animada al montar el componente. Pensada para los números
// del hero: los que hay en una fila montan a la vez, así que suben juntos.
//
// Dos modos:
//   - Normal (rAF): interpola de `startFraction`·value → value, con `step` para
//     redondear a saltos (menos parpadeo) y easeOutQuad (aterrizaje suave).
//   - popSteps: para números pequeños que solo saltan pocos enteros (p. ej. los
//     2 volúmenes de la cocina). Va 0 → 1 → 2 mostrando cada entero con un
//     "pop"/acercamiento (keyframe count-pop) y una espera entre pasos, para dar
//     sensación de conteo pausado.
export default function CountUp({
  value,
  duration = 1600,
  startDelay = 250,
  startFraction = 0.7,
  step = 1,
  popSteps = false,
  popStepMs = 650,
  format = (v) => `${Math.round(v)}`,
  className,
}) {
  const from = popSteps ? 0 : value * startFraction;
  const snap = (v) => Math.round(v / step) * step;
  const [display, setDisplay] = useState(() => format(popSteps ? 0 : snap(from)));
  const [popKey, setPopKey] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // --- Modo por pasos con "pop" ---
    if (popSteps) {
      const target = Math.round(value);
      const timers = [];
      for (let i = 1; i <= target; i++) {
        timers.push(
          setTimeout(() => {
            setDisplay(format(i));
            setPopKey((k) => k + 1); // re-monta el span → repite la animación pop
          }, startDelay + i * popStepMs)
        );
      }
      return () => timers.forEach(clearTimeout);
    }

    // --- Modo normal (interpolación suave) ---
    let rafId;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 2); // easeOutQuad
      const currentRaw = from + (value - from) * eased;
      setDisplay(format(p < 1 ? snap(currentRaw) : value));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, startDelay);
    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration, startDelay, startFraction, step, popSteps, popStepMs]);

  // ── Anchura reservada de antemano ──────────────────────────────────────────
  // El número cambia de anchura mientras cuenta (+1.26M ocupa más que +1.8M, y
  // 70% menos que 100%), y en el hero de la home eso movía la columna entera:
  // los tres números están en una fila `justify-between` que manda en el ancho
  // del bloque de texto, así que la foto de la derecha subía y bajaba sola
  // durante toda la cuenta.
  //
  // La caja se dimensiona con una COPIA INVISIBLE del valor FINAL, apilada en
  // la misma celda de rejilla que el número vivo. Así la anchura es la
  // definitiva desde el primer fotograma y ya no se mueve nada. `tabular-nums`
  // remata el detalle fino: hace que todas las cifras midan igual, para que
  // cambiar un 1 por un 8 tampoco desplace nada.
  //
  // Se hace aquí, en el componente, y no en cada sitio que lo usa, para que
  // ningún contador futuro vuelva a traerse el salto de vuelta.
  const reserva = format(value);
  const cajaFija = { display: 'inline-grid', fontVariantNumeric: 'tabular-nums' };
  const celda = { gridArea: '1 / 1' };

  if (popSteps) {
    return (
      <span className={className} style={cajaFija}>
        <span style={{ ...celda, visibility: 'hidden' }} aria-hidden="true">{reserva}</span>
        <span key={popKey} style={celda} className="animate-[count-pop_0.5s_ease-out]">
          {display}
        </span>
      </span>
    );
  }
  return (
    <span className={className} style={cajaFija}>
      <span style={{ ...celda, visibility: 'hidden' }} aria-hidden="true">{reserva}</span>
      <span style={celda}>{display}</span>
    </span>
  );
}
