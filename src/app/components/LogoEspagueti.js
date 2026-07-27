'use client';

// El logo de la portada, partido en sus cuatro letras para que al arrancar el
// formulario cada una salga volando hacia su esquina, estirándose como un
// espagueti.
//
// Truco: no se recorta la imagen ni hace falta un SVG por letra. El logo YA está
// maquetado en rejilla 2×2 —SQ arriba, FT abajo—, así que basta con cuatro
// cuadrados que enseñan cada uno su cuarto de la misma imagen, moviendo
// `background-position`. Se ve exactamente igual que el logo entero hasta que
// empieza el movimiento, y cada trozo es un elemento propio que se puede animar.
//
// Direcciones (las que pidió María, que son las naturales de la rejilla):
//   S ↖   Q ↗
//   F ↙   T ↘

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
      className={`relative shrink-0 ${className}`}
      style={{ width: tamano, height: tamano }}
      role="img"
      aria-label="Squad Fit"
    >
      {LETRAS.map(({ clave, fila, columna }) => (
        <span
          key={clave}
          aria-hidden
          className={saliendo ? `sf-letra sf-letra-${clave}` : undefined}
          style={{
            position: 'absolute',
            top: fila * mitad,
            left: columna * mitad,
            width: mitad,
            height: mitad,
            backgroundImage: 'url(/LogotipoSquatfit.png)',
            backgroundSize: `${tamano}px ${tamano}px`,
            backgroundPosition: `${-columna * mitad}px ${-fila * mitad}px`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      ))}
    </div>
  );
}
