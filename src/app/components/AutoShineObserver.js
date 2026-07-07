'use client';
import { useEffect } from 'react';

// Arranca el auto-brillo de los botones (.landing-autoshine) SOLO cuando el
// botón entra en pantalla, no al cargar la página. Así el contador de pasadas
// empieza desde que el usuario ve cada botón (los CTAs de más abajo también se
// ven brillar, en vez de agotar sus pasadas antes de llegar a ellos).
export default function AutoShineObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('shine-go');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    let scheduled = false;
    const scan = () => {
      scheduled = false;
      document
        .querySelectorAll('.landing-autoshine:not(.shine-go)')
        .forEach((el) => io.observe(el));
    };
    const schedule = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(scan);
      }
    };

    scan();
    // Re-escanear cuando el DOM cambia (contenido que se hidrata o aparece)
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
