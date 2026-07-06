'use client';

import { useEffect, useRef, useState } from 'react';

// Devuelve [ref, visible]: visible pasa a true la primera vez que el
// elemento entra en pantalla. Respeta "reducir movimiento" del sistema.
export default function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}
