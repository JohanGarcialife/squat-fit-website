'use client';

// El logo de la portada, partido en sus cuatro letras para que al arrancar el
// formulario cada una salga girando en espiral hacia su esquina.
//
// Truco para partirlo: no se recorta la imagen ni hace falta un SVG por letra.
// El logo YA está maquetado en rejilla 2×2 —SQ arriba, FT abajo—, así que basta
// con cuatro cuadrados que enseñan cada uno su cuarto de la misma imagen,
// moviendo `background-position`. Se ve exactamente igual que el logo entero
// hasta que empieza el movimiento.
//
// Truco para la espiral: cada letra va envuelta en un elemento «órbita». La
// órbita GIRA y la letra, dentro, se ALEJA en línea recta. Un movimiento
// rectilíneo dentro de algo que gira es, exactamente, una espiral — y sale sin
// tener que calcular a mano los puntos de la curva en los keyframes.
//
// Direcciones de partida (las de la propia rejilla):  S ↖  Q ↗  F ↙  T ↘

import React from 'react';

const LETRAS = [
  { clave: 'S', fila: 0, columna: 0 },
  { clave: 'Q', fila: 0, columna: 1 },
  { clave: 'F', fila: 1, columna: 0 },
  { clave: 'T', fila: 1, columna: 1 },
];

export default function LogoEspagueti({ tamano = 96, saliendo = false, className = '' }) {
  const mitad = tamano / 2;
  return (
    <div
      className={`relative shrink-0 ${className} ${saliendo ? 'sf-logo-saliendo' : ''}`}
      // La perspectiva es lo que hace que el giro se vea con profundidad en vez
      // de plano: las letras se van «hacia dentro» además de hacia fuera.
      style={{ width: tamano, height: tamano, perspective: `${tamano * 8}px` }}
      role="img"
      aria-label="Squad Fit"
    >
      {LETRAS.map(({ clave, fila, columna }) => (
        <span
          key={clave}
          aria-hidden
          className={saliendo ? `sf-orbita sf-orbita-${clave}` : undefined}
          style={{
            position: 'absolute',
            top: fila * mitad,
            left: columna * mitad,
            width: mitad,
            height: mitad,
            // El centro de giro es el centro del logo, no el de cada trozo: por
            // eso las cuatro giran juntas como una sola pieza al arrancar.
            transformOrigin: `${columna ? 0 : mitad}px ${fila ? 0 : mitad}px`,
          }}
        >
          <span
            className={saliendo ? `sf-vuelo sf-vuelo-${clave}` : undefined}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              backgroundImage: 'url(/LogotipoSquatfit.png)',
              backgroundSize: `${tamano}px ${tamano}px`,
              backgroundPosition: `${-columna * mitad}px ${-fila * mitad}px`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </span>
      ))}
    </div>
  );
}
