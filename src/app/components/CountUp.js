'use client';

import { useEffect, useRef, useState } from 'react';

// Cuenta ascendente animada (0 → value) al montar el componente (arranca tras
// un pequeño retardo para que se vea el crecimiento). Pensado para los números
// del hero, que están arriba y se ven en cuanto carga la página: los tres
// montan a la vez, así que suben simultáneamente y dan sensación de dinamismo.
export default function CountUp({ value, duration = 1600, startDelay = 250, format = (v) => `${Math.round(v)}`, className }) {
  const [display, setDisplay] = useState(() => format(0));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let rafId;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(format(value * eased));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration, startDelay]);

  return <span className={className}>{display}</span>;
}
