'use client';

import { useEffect } from 'react';

// Carrito 3.3: al volver desde /cart, restaurar la posición exacta de scroll
// de la página desde la que se fue al carrito.
//
// - `rememberCartReturnPoint()` se llama justo antes de navegar a /cart.
// - La página /cart marca `sqf-from-cart` al desmontarse.
// - <CartScrollRestore /> (montado en el layout público) restaura el scroll si
//   la página actual es la misma desde la que se fue al carrito.

const POINT_KEY = 'sqf-cart-return';
const FLAG_KEY = 'sqf-from-cart';

export function rememberCartReturnPoint() {
  try {
    sessionStorage.setItem(
      POINT_KEY,
      JSON.stringify({ path: window.location.pathname, y: window.scrollY })
    );
  } catch {}
}

export function markLeavingCart() {
  try {
    sessionStorage.setItem(FLAG_KEY, '1');
  } catch {}
}

export default function CartScrollRestore() {
  useEffect(() => {
    let saved = null;
    try {
      if (sessionStorage.getItem(FLAG_KEY) !== '1') return;
      saved = JSON.parse(sessionStorage.getItem(POINT_KEY) || 'null');
    } catch {}
    if (!saved || saved.path !== window.location.pathname) return;
    try {
      sessionStorage.removeItem(FLAG_KEY);
      sessionStorage.removeItem(POINT_KEY);
    } catch {}

    // Reintentos cortos: la altura final depende de imágenes/hidratación.
    const target = saved.y;
    let tries = 0;
    const attempt = () => {
      const se = document.scrollingElement || document.documentElement;
      se.scrollTop = target;
      window.scrollTo(0, target);
      tries += 1;
      if (tries < 12 && Math.abs(se.scrollTop - target) > 2) {
        setTimeout(attempt, 100);
      }
    };
    requestAnimationFrame(attempt);
  }, []);

  return null;
}
