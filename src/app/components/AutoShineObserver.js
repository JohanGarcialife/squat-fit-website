'use client';
import { useEffect } from 'react';

// Arranca el auto-brillo de los botones (.landing-autoshine) SOLO cuando el
// botón entra en pantalla, no al cargar la página. Así el contador de pasadas
// empieza desde que el usuario ve cada botón.
//
// IMPORTANTE: la clase .landing-autoshine vive en el SPAN del destello, que
// está desplazado -100% (fuera del botón) y recortado por overflow-hidden. Si
// observamos ese span, el IntersectionObserver lo ve siempre fuera de pantalla
// y nunca dispara. Por eso observamos el BOTÓN contenedor y, cuando entra en
// pantalla, añadimos .shine-go al span de dentro.
export default function AutoShineObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll('.landing-autoshine')
              .forEach((span) => span.classList.add('shine-go'));
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    let scheduled = false;
    const scan = () => {
      scheduled = false;
      document
        .querySelectorAll('.landing-autoshine:not(.shine-go)')
        .forEach((span) => {
          const host = span.closest('button, a') || span.parentElement;
          if (host) io.observe(host);
        });
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
