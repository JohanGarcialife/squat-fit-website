'use client';

import React, { useEffect, useState } from 'react';

// Agenda embebida de la sesión diagnóstica (15.10): iframe responsive de
// agenda.squatfit.es con los UTM de la URL actual reenviados como query params
// (así la reserva conserva la atribución de la campaña). Si el navegador no
// puede pintar el iframe, queda siempre el enlace de debajo como respaldo.
const AGENDA_BASE = 'https://agenda.squatfit.es/sesion-diagnostica';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

export default function AgendaSection() {
  // La URL se calcula en cliente (necesita window.location); hasta entonces se
  // usa la base sin UTM para que el server render no difiera del primer paint.
  const [agendaUrl, setAgendaUrl] = useState(AGENDA_BASE);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      const current = new URLSearchParams(window.location.search);
      const forward = new URLSearchParams();
      UTM_KEYS.forEach((k) => {
        const v = current.get(k);
        if (v) forward.set(k, v);
      });
      const qs = forward.toString();
      if (qs) setAgendaUrl(`${AGENDA_BASE}?${qs}`);
    } catch {
      // Sin UTM: la base ya sirve
    }
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

        {!failed && (
          <div className="w-full rounded-[28px] overflow-hidden border border-slate-100 shadow-lg bg-[#F8F9FC]">
            <iframe
              src={agendaUrl}
              title="Agenda de la sesión diagnóstica de Squad Fit"
              className="w-full block"
              style={{ height: 'min(720px, 85vh)', border: 'none' }}
              loading="lazy"
              onError={() => setFailed(true)}
              allow="payment"
            />
          </div>
        )}

        {/* Respaldo: siempre visible por si el iframe no carga en algún navegador */}
        <a
          href={agendaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            failed
              ? 'mt-2 inline-block bg-primary hover:bg-[#e05b08] text-white font-bold text-lg px-9 py-4 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer'
              : 'mt-5 text-slate-400 hover:text-primary text-sm font-semibold underline underline-offset-2 transition-colors'
          }
        >
          {failed ? 'Abrir la agenda para reservar' : '¿No ves la agenda? Ábrela en una pestaña nueva'}
        </a>
      </div>
    </section>
  );
}
