'use client';

import { useEffect, useRef, useState } from 'react';

// Devuelve [ref, visible]: visible pasa a true la primera vez que el
// elemento entra en pantalla. Cálculo por scroll (no IntersectionObserver):
// en Safari de iOS el observer no disparaba de forma fiable. Respeta
// "reducir movimiento" del sistema.
export default function useInView(ratio = 0.88) {
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
      if (rect.top < window.innerHeight * ratio && rect.bottom > 0) {
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

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ratio]);

  return [ref, visible];
}
