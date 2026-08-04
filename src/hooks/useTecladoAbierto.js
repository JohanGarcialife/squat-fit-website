'use client';

import { useEffect, useState } from 'react';

/**
 * ¿Está el teclado del móvil ocupando pantalla ahora mismo?
 *
 * POR QUÉ HACE FALTA. En el paso 2 el resumen va pegado abajo (`sticky`) con el
 * botón «Continuar». Cuando el cliente toca un campo, iOS levanta el teclado y
 * se come la mitad de la pantalla: entre el teclado abajo y la barra encima de
 * él, del formulario quedaba visible una franja de dos o tres campos, y encima
 * el que estabas rellenando podía quedar tapado. Con la barra escondida
 * mientras se escribe, el formulario recupera ese espacio; en cuanto se cierra
 * el teclado, la barra vuelve y el botón está donde se espera.
 *
 * CÓMO SE DETECTA. No hay API de «teclado abierto» en la web. Lo que sí hay es
 * `visualViewport`, que SÍ encoge cuando el teclado sube (mientras que
 * `window.innerHeight` no se entera en iOS). Se compara su altura con la de la
 * ventana: si falta un buen trozo, hay teclado.
 *
 * El umbral es del 25 %: las barras del navegador que aparecen y desaparecen al
 * hacer scroll mueven la altura un 10-15 %, y un umbral más fino haría
 * parpadear el botón al desplazarse, que es peor que el problema original.
 *
 * Sin `visualViewport` (navegadores viejos) devuelve siempre `false`: la barra
 * se queda como estaba y no se rompe nada.
 */
export default function useTecladoAbierto() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;

    const revisar = () => {
      setAbierto(vv.height < window.innerHeight * 0.75);
    };
    revisar();

    vv.addEventListener('resize', revisar);
    vv.addEventListener('scroll', revisar);
    return () => {
      vv.removeEventListener('resize', revisar);
      vv.removeEventListener('scroll', revisar);
    };
  }, []);

  return abierto;
}
