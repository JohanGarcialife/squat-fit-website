'use client';

import { useEffect, useRef } from 'react';

/**
 * Cierra un panel al tocar FUERA de él y al pulsar Escape.
 *
 * Por qué así y no de otra forma (esto es lo que se rompe si se toca):
 *
 * - `pointerdown` y no `click`: en móvil el `click` llega ~300 ms después del
 *   dedo y, sobre todo, se dispara DESPUÉS de que el navegador haya decidido
 *   sobre qué elemento cae. Con paneles que se mueven o que scrollean, el
 *   `click` acaba yendo a otro sitio y el cierre se siente pegajoso.
 *   `pointerdown` cubre dedo, ratón y lápiz con un solo listener.
 *
 * - El listener va en CAPTURA: así el cierre no depende de que ningún hijo
 *   deje propagar el evento (hay botones que llaman a stopPropagation).
 *
 * - `refs` son las zonas que NO cierran. Hay que incluir el botón que abre el
 *   panel: si no, el mismo gesto que abre dispara este cierre y el botón
 *   parece no funcionar (abre y cierra a la vez). Lo normal es pasar UNA ref
 *   al contenedor que envuelve botón y panel: entonces el botón sigue siendo
 *   un interruptor normal y todo lo de dentro se puede tocar tranquilo.
 *
 * - Ni bloquea el scroll ni lo desbloquea: quien tape la página con un fondo
 *   (`CartDrawer`, `BurgerMenu`, `FormChrome`) ya se ocupa de su
 *   `body.style.overflow`. Añadirlo aquí lo dejaría bloqueado a quien no lo
 *   bloqueó nunca.
 *
 * @param {boolean} abierto  Solo escucha mientras está abierto.
 * @param {Function} onCerrar  Qué hacer para cerrar.
 * @param {Array<{current: ?Element}>} refs  Zonas que no cierran.
 */
export default function useCerrarAlTocarFuera(abierto, onCerrar, refs) {
  // Los listeners se registran una sola vez por apertura, así que leen la
  // versión de turno desde aquí en vez de re-registrarse en cada render.
  const vivos = useRef({ onCerrar, refs });
  useEffect(() => {
    vivos.current = { onCerrar, refs };
  });

  useEffect(() => {
    if (!abierto) return;

    const cerrar = () => vivos.current.onCerrar?.();

    const dentro = (target) =>
      (vivos.current.refs || []).some((ref) => ref?.current?.contains(target));

    const alTocar = (e) => {
      if (!dentro(e.target)) cerrar();
    };
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrar();
    };

    document.addEventListener('pointerdown', alTocar, true);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('pointerdown', alTocar, true);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);
}
