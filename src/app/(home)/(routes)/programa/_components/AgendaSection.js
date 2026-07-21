'use client';

import React, { useEffect } from 'react';

// Agenda de la sesión diagnóstica (15.10) embebida con el WIDGET INLINE oficial
// de TidyCal. La página de reserva (agenda.squatfit.es / tidycal.com) manda
// X-Frame-Options y NO se puede meter en un <iframe> normal (salía "contenido
// bloqueado"); el widget de TidyCal sí está pensado para incrustarse.
// data-path = ruta de la cita de EQUIPO en tidycal.com (team/agendas/<slug>).
const TIDYCAL_PATH = 'team/agendas/sesion-diagnostica';
const TIDYCAL_EMBED_JS = 'https://asset-tidycal.b-cdn.net/js/embed.js';
// Respaldo (abrir en pestaña) por si el navegador bloquea scripts de terceros.
const AGENDA_FALLBACK_URL = 'https://agenda.squatfit.es/sesion-diagnostica';

export default function AgendaSection() {
  // Inyecta el script del widget en cada montaje: al cargar, embed.js escanea
  // los `.tidycal-embed` presentes y pinta el calendario. Re-inyectar en cada
  // montaje hace que funcione también con la navegación cliente de Next.
  useEffect(() => {
    const script = document.createElement('script');
    script.src = TIDYCAL_EMBED_JS;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        /* ya retirado */
      }
    };
  }, []);

  return (
    <section id="agenda" className="bg-white py-20 sm:py-24 px-6 sm:px-12 md:px-20 scroll-mt-24">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-2xl uppercase whitespace-nowrap">Reserva tu llamada</span>
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Elige día y hora ahora mismo
          </h2>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl">
            Sesión diagnóstica gratuita de 25-40 minutos. Escoge el hueco que mejor
            te venga y hablamos de tu caso.
          </p>
        </div>

        {/* Widget inline de TidyCal (se pinta solo al cargar embed.js). El
            min-height evita el salto de layout mientras carga. */}
        <div className="w-full rounded-[28px] overflow-hidden border border-slate-100 shadow-lg bg-[#F8F9FC] p-2 sm:p-4">
          <div className="tidycal-embed" data-path={TIDYCAL_PATH} style={{ minHeight: 'min(720px, 80vh)' }} />
        </div>

        {/* Respaldo discreto por si el widget no carga (bloqueadores, etc.) */}
        <a
          href={AGENDA_FALLBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 text-slate-400 hover:text-primary text-sm font-semibold underline underline-offset-2 transition-colors"
        >
          ¿No ves la agenda? Ábrela en una pestaña nueva
        </a>
      </div>
    </section>
  );
}
