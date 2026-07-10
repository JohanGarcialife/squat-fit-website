'use client';

import React, { useEffect, useRef, useState } from 'react';

// Envuelve una sección para que entre con un fundido + deslizamiento suave
// la primera vez que aparece en pantalla al hacer scroll.
// Usa cálculo de posición por scroll (no IntersectionObserver): en Safari de
// iOS el observer no disparaba de forma fiable y las secciones se quedaban
// invisibles. Respeta la preferencia de "reducir movimiento".
export default function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    let done = false;
    const check = () => {
      if (done) return;
      const rect = el.getBoundingClientRect();
      // Revelar cuando el borde superior entra en el 88% inferior de la pantalla
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        done = true;
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        check();
      });
    };

    check(); // por si ya está en pantalla al cargar
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}
