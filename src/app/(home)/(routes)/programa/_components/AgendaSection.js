import React from 'react';
import Link from 'next/link';

// Reserva de la sesión diagnóstica — SIEMPRE pasando por el formulario.
//
// Antes esta sección incrustaba el calendario de TidyCal y dejaba agendar de
// golpe. Se quitó el 28-jul por una razón de negocio, no de código: una cita
// agendada sin formulario llega SIN NADA sobre la persona (ni objetivo, ni
// presupuesto, ni qué ha intentado ya), así que no se puede cualificar ni
// preparar la llamada, y el rato se gasta igual. Bajará algo el número de citas
// y subirá lo que valen: el formulario son 2 minutos, y quien no los invierte
// tampoco iba a invertir seis meses.
//
// El calendario no ha desaparecido: vive al final del formulario (`BOOKING_URL`
// en empieza-tu-cambio), que es donde toca ahora.
//
// OJO si alguien vuelve a poner aquí un enlace directo a agenda.squadfit.es:
// estaría reabriendo justo el agujero que esto cierra.
export default function AgendaSection() {
  return (
    <section id="agenda" className="bg-white py-20 sm:py-24 px-6 sm:px-12 md:px-20 scroll-mt-24">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-2xl uppercase whitespace-nowrap">
              Reserva tu llamada
            </span>
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Cuéntame tu caso y elige hora
          </h2>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl">
            Sesión diagnóstica gratuita de 25-40 minutos. Antes de darte hueco te
            hago unas preguntas rápidas: así llego a la llamada sabiendo de qué
            hablamos y no gastamos el rato en lo básico.
          </p>
        </div>

        <div className="w-full rounded-[28px] border border-slate-100 shadow-lg bg-[#F8F9FC] px-6 py-10 sm:px-12 sm:py-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-sm">
            2 minutos · unas pocas preguntas
          </span>

          <p className="text-slate-700 text-lg mt-6 max-w-xl">
            Al terminar eliges día y hora directamente. Si lo dejas a medias, se
            guarda en tu navegador y puedes seguir donde lo dejaste.
          </p>

          <Link
            href="/empieza-tu-cambio"
            className="mt-8 inline-block rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-white shadow-lg
                       transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Empezar y reservar mi llamada
          </Link>

          <p className="text-slate-400 text-sm mt-5">
            Gratis y sin compromiso.
          </p>
        </div>
      </div>
    </section>
  );
}
