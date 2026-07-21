'use client';

import React from 'react';

// Sección de reseñas de Trustpilot para /programa. Datos reales del perfil
// público es.trustpilot.com/review/squatfit.es (nota 4,7/5 · 72 opiniones a
// 21-jul-2026). Estático a propósito: el widget oficial en vivo es de pago.
// Actualizar RATING/COUNT y las reseñas a mano cuando cambien.
const PROFILE_URL = 'https://es.trustpilot.com/review/squatfit.es';
const RATING = '4,7';
const REVIEW_COUNT = 72;

const reviews = [
  {
    name: 'Javier Contreras',
    title: 'Le debo mi vida',
    text: 'Pesaba 145 kg cuando empecé. Perdí 50 kilos hasta el día de mi boda y me sentía capaz de todo. El proceso fue largo, pero nunca me soltó la mano.',
  },
  {
    name: 'Marta',
    title: 'Cercanía y firmeza',
    text: 'No hay nadie en quien confíe tanto como en María. Es muy humana, pero también firme para sacar lo mejor de ti.',
  },
  {
    name: 'Víctor',
    title: 'Su método funciona',
    text: 'María y Hamlet hacen un trabajo increíble. He mejorado mi físico y tengo mucha más energía en solo 2 meses. Siempre están atentos.',
  },
  {
    name: 'Sílvia Caballero',
    title: 'Superó mis expectativas',
    text: 'Mi experiencia superó todas mis expectativas. La relación ha ido mucho más allá de la de entrenadora-cliente.',
  },
];

// Estrella estilo Trustpilot: cuadrado verde con estrella blanca (su marca).
function TrustStars({ count = 5, size = 'w-7 h-7' }) {
  return (
    <div className="flex gap-1" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`${size} rounded-[4px] flex items-center justify-center`}
          style={{ backgroundColor: i < count ? '#00B67A' : '#DCDCE6' }}
        >
          <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="#fff" aria-hidden="true">
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function TrustpilotPrograma() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#F8F9FC] overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

        {/* Cabecera: nota media + Trustpilot */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 sm:w-14 h-[2px] bg-[#FF690B] rounded-full" />
            <span className="text-[#FF690B] font-bold tracking-[0.2em] text-sm sm:text-xl uppercase">
              Opiniones reales
            </span>
            <span className="w-6 sm:w-14 h-[2px] bg-[#FF690B] rounded-full" />
          </div>

          <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-5xl tracking-tight mb-6">
            Excelente en Trustpilot
          </h2>

          <div className="flex flex-col items-center gap-3">
            <TrustStars count={5} size="w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-[#363C98] font-bold text-lg sm:text-xl">
              <span className="text-2xl sm:text-3xl font-extrabold">{RATING}</span> / 5
              <span className="text-[#6B6BA8] font-medium"> · basado en {REVIEW_COUNT} opiniones verificadas</span>
            </p>
            <div className="flex items-center gap-1.5 text-[#00B67A] font-bold">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
              </svg>
              <span>Trustpilot</span>
            </div>
          </div>
        </div>

        {/* Rejilla de reseñas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-[24px] p-6 sm:p-7 shadow-md border border-slate-100 flex flex-col text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <TrustStars count={5} size="w-6 h-6" />
                <span className="flex items-center gap-1 text-[#00B67A] text-xs font-bold">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
                  </svg>
                  Verificada
                </span>
              </div>
              <h3 className="text-[#363C98] font-extrabold text-lg mb-2">{r.title}</h3>
              <p className="text-[#64748B] leading-relaxed font-medium flex-grow">{r.text}</p>
              <p className="text-[#363C98] font-bold mt-5">{r.name}</p>
            </div>
          ))}
        </div>

        {/* CTA al perfil */}
        <div className="flex justify-center mt-12">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-bold text-white text-base sm:text-lg shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            style={{ backgroundColor: '#363C98' }}
          >
            Ver todas las opiniones en Trustpilot
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10" /></svg>
          </a>
        </div>

      </div>
    </section>
  );
}
