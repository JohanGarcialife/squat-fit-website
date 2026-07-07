'use client';

import React, { useEffect, useRef, useState } from 'react';

// Envuelve una sección para que entre con un fundido + deslizamiento suave
// la primera vez que aparece en pantalla al hacer scroll.
// Respeta la preferencia de "reducir movimiento" del sistema del usuario.
export default function Reveal({ children, delay = 0 }) {
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
      // Umbral bajo: en secciones muy altas (o parcialmente recortadas en
      // pantallas estrechas) un umbral mayor podía no dispararse nunca en iOS
      // y la sección se quedaba invisible.
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
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
