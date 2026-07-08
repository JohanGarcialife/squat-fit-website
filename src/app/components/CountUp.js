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

  if (popSteps) {
    return (
      <span key={popKey} className={`inline-block animate-[count-pop_0.5s_ease-out] ${className || ''}`}>
        {display}
      </span>
    );
  }
  return <span className={className}>{display}</span>;
}
