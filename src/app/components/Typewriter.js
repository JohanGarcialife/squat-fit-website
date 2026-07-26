'use client';

import React, { useEffect, useRef, useState } from 'react';

// Texto que se escribe solo, para las pantallas de los formularios que son solo
// texto (títulos, intros, pantallas informativas): así no cae de golpe un bloque
// entero y el ojo puede seguirlo.
//
// El texto completo está SIEMPRE en el DOM: la parte aún no escrita se pinta
// transparente. Así no hay saltos de maquetación mientras se escribe y los
// lectores de pantalla leen la frase entera desde el principio.
//
// `instant` lo muestra de golpe: se usa al volver ATRÁS a un paso ya visto
// (repetir la animación ahí es redundante y estorba al revisar lo respondido).
// También se salta con «reducir movimiento» activado.
//
// `onDone` avisa al terminar, para encadenar: primero el título, y solo cuando
// acaba, el texto o las casillas de respuesta.

export default function Typewriter({
  text = '',
  as: Tag = 'p',
  speed = 16,          // ms por carácter
  startDelay = 120,    // espera antes de arrancar
  caret = false,
  instant = false,
  onDone,
  className = '',
  style,
}) {
  const [count, setCount] = useState(instant ? text.length : 0);
  const timers = useRef([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (instant || sinMovimiento || !text) {
      setCount(text.length);
      onDoneRef.current?.();
      return undefined;
    }

    setCount(0);
    let i = 0;
    const paso = () => {
      i += 1;
      setCount(i);
      if (i < text.length) {
        timers.current.push(setTimeout(paso, speed));
      } else {
        onDoneRef.current?.();
      }
    };
    timers.current.push(setTimeout(paso, startDelay));

    return () => timers.current.forEach(clearTimeout);
  }, [text, speed, startDelay, instant]);

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
