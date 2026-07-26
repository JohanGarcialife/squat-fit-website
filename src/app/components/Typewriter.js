'use client';

import React, { useEffect, useRef, useState } from 'react';

// Texto que se escribe solo, para las pantallas de los formularios que son solo
// texto (intro, pantallas informativas): así no cae de golpe un bloque entero.
//
// El texto completo está SIEMPRE en el DOM: la parte aún no escrita se pinta
// transparente. Así no hay saltos de maquetación mientras se escribe y los
// lectores de pantalla leen la frase entera desde el principio.
//
// Con «reducir movimiento» activado aparece completo al instante.

export default function Typewriter({
  text = '',
  as: Tag = 'p',
  speed = 16,          // ms por carácter
  startDelay = 120,    // espera antes de arrancar
  caret = false,
  className = '',
  style,
}) {
  const [count, setCount] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (sinMovimiento || !text) {
      setCount(text.length);
      return undefined;
    }

    setCount(0);
    let i = 0;
    const paso = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timers.current.push(setTimeout(paso, speed));
    };
    timers.current.push(setTimeout(paso, startDelay));

    return () => timers.current.forEach(clearTimeout);
  }, [text, speed, startDelay]);

  const escrito = text.slice(0, count);
  const pendiente = text.slice(count);
  const terminado = count >= text.length;

  return (
    <Tag className={className} style={style}>
      <span style={{ whiteSpace: 'pre-line' }}>{escrito}</span>
      {caret && !terminado && <span className="sf-caret" aria-hidden="true" />}
      {/* Reserva el espacio del texto que falta para que nada se mueva */}
      <span aria-hidden="true" style={{ opacity: 0, whiteSpace: 'pre-line' }}>
        {pendiente}
      </span>
    </Tag>
  );
}
