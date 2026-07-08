'use client';

import { useEffect, useRef, useState } from 'react';

// Cuenta ascendente animada al montar el componente. Pensada para los números
// del hero: los tres montan a la vez, así que suben simultáneamente.
//
// Para que no se vea frenético:
//   - startFraction: arranca desde un número CERCANO al final (p. ej. 0.7 →
//     empieza en el 70% del valor), reduciendo el recorrido.
//   - step: redondea a saltos (p. ej. de 10 en 10) para que las cifras no
//     parpadeen por todos los números intermedios.
//   - duration algo más larga = subida más pausada.
export default function CountUp({
  value,
  duration = 1600,
  startDelay = 250,
  startFraction = 0.7,
  step = 1,
  format = (v) => `${Math.round(v)}`,
  className,
}) {
  const from = value * startFraction;
  const snap = (v) => Math.round(v / step) * step;
  const [display, setDisplay] = useState(() => format(snap(from)));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let rafId;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      // easeOutQuad: aterriza suave (el último tramo más lento que los otros)
      // pero sin la cola tan larga del cubic, para que no se sienta brusco.
      const eased = 1 - Math.pow(1 - p, 2);
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
  }, [value, duration, startDelay, startFraction, step]);

  return <span className={className}>{display}</span>;
}
