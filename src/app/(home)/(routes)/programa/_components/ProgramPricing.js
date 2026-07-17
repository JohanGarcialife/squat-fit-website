'use client';

import React from 'react';
import Link from 'next/link';

// ── Enlace de reserva de llamada ─────────────────────────────────────────────
// Cuando tengáis Calendly, pega aquí el enlace del evento
// (p. ej. https://calendly.com/squatfit/valoracion). Sirve igual un enlace de
// TidyCal mientras tanto. Si se deja vacío, el botón lleva a /contacto.
const BOOKING_URL = ''; // ← pega aquí tu link de Calendly (o TidyCal)

const bookHref = BOOKING_URL || '/contacto';
const bookExternal = Boolean(BOOKING_URL);

// Programa Tu Mejor Versión: 2 formatos completos + 2 módulos sueltos.
// Sin precios en la landing: es venta en llamada (alto ticket). Cada módulo
// incluye su curso de formación como una parte más del producto.
const FORMATS = [
  {
    icon: '⭐',
    name: 'Premium',
    tagline: 'Dieta, entreno, mentalidad y comunidad',
    features: ['Dieta y entreno personalizados', '+22 h de formación grabada', 'Clases en vivo cada semana', 'Comunidad y acompañamiento'],
    highlight: true,
  },
  {
    icon: '💪',
    name: 'Original',
    tagline: 'Dieta, entreno y seguimiento',
    features: ['Dieta y entreno personalizados', '+22 h de formación grabada', 'Seguimiento continuo'],
  },
  {
    icon: '🥗',
    name: 'Módulo Nutrición',
    tagline: 'Enfocado en perder grasa',
    features: ['Dieta 100 % personalizada', 'Curso «Nutrición para Perder grasa» (12 h)', 'Seguimiento de tu progreso'],
  },
  {
    icon: '👟',
    name: 'Módulo Entrenamiento',
    tagline: 'Enfocado en ganar músculo',
    features: ['Entreno 100 % personalizado', 'Curso «Entreno para Ganar musculo» (12 h)', 'Seguimiento de tu progreso'],
  },
];

// Botón de reserva: enlace externo (Calendly/TidyCal) en pestaña nueva, o Link
// interno a /contacto mientras no haya URL configurada.
function BookButton({ className, children }) {
  if (bookExternal) {
    return <a href={bookHref} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  return <Link href={bookHref} className={className}>{children}</Link>;
}

function Feature({ children }) {
  return (
    <li className="flex items-start gap-2 text-slate-600 text-sm sm:text-[15px]">
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default function ProgramPricing() {
  return (
    // id="shop-plans": los CTAs "Unirme al programa" de toda la página hacen
    // scroll hasta aquí (antes apuntaban a un id inexistente y no hacían nada).
    <section id="shop-plans" className="relative bg-[#F8F9FC] py-20 sm:py-28 px-6 sm:px-12 md:px-20 overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#363c98]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Cabecera */}
      <div className="w-full flex flex-col items-center mb-14 text-center">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap">El Programa</span>
          <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
        </div>
        <h2 className="text-[#363C98] font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-4xl">
          Elige por dónde empezar
        </h2>
        <p className="text-slate-600 text-lg sm:text-xl mt-5 max-w-2xl">
          Reserva una llamada gratuita: vemos tu caso, te contamos cómo funciona y diseñamos tu plan. Sin compromiso.
        </p>
      </div>

      {/* Tarjetas de formato (qué incluye, sin precio) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {FORMATS.map((f) => (
          <div
            key={f.name}
            className={`relative flex flex-col rounded-[28px] p-7 bg-white transition-transform duration-300 hover:-translate-y-1 ${
              f.highlight ? 'ring-2 ring-primary shadow-xl' : 'border border-slate-100 shadow-md'
            }`}
          >
            {f.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                Recomendado
              </span>
            )}

            <div className="text-4xl mb-3" aria-hidden="true">{f.icon}</div>
            <h3 className="text-[#363C98] font-extrabold text-xl leading-tight min-h-[3.25rem]">{f.name}</h3>
            <p className="text-slate-500 text-sm mt-1 mb-5 min-h-[2.5rem]">{f.tagline}</p>

            <ul className="flex flex-col gap-2.5 mb-7 flex-grow">
              {f.features.map((feat) => <Feature key={feat}>{feat}</Feature>)}
            </ul>

            <BookButton
              className={`mt-auto block w-full text-center rounded-2xl py-3 font-bold text-base active:scale-95 transition-all duration-200 cursor-pointer ${
                f.highlight
                  ? 'bg-primary text-white hover:bg-[#e05b08]'
                  : 'bg-[#FFEDE0] text-primary hover:bg-primary hover:text-white'
              }`}
            >
              Reserva tu llamada
            </BookButton>
          </div>
        ))}
      </div>

      {/* Banda principal: reserva de llamada */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="rounded-[28px] bg-[#363C98] text-white p-7 sm:p-10 flex flex-col items-center text-center gap-4">
          <h3 className="font-extrabold text-2xl sm:text-3xl max-w-2xl">Hablemos de tu caso en una llamada</h3>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl">
            15-20 minutos, sin compromiso. Vemos tu situación y te decimos si podemos ayudarte y cómo.
          </p>
          <BookButton className="mt-2 inline-block bg-primary hover:bg-[#e05b08] text-white font-bold text-lg px-9 py-4 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer">
            Reserva tu llamada gratuita
          </BookButton>
          <p className="text-white/60 text-sm mt-1">
            ¿Ya lo tienes claro? También puedes{' '}
            <BookButton className="underline underline-offset-2 hover:text-white font-medium">reservar tu plaza</BookButton>{' '}
            (250 €, se descuenta del total).
          </p>
        </div>
      </div>
    </section>
  );
}
