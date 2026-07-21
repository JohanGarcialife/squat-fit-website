'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useWindowSize from '@/hooks/UseWindowSize';
import useSlickWrapSpeed from '@/hooks/useSlickWrapSpeed';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

// Sección de reseñas de Trustpilot para /programa. Datos reales del perfil
// público es.trustpilot.com/review/squatfit.es (nota 4,7/5 · 72 opiniones a
// 21-jul-2026). Estático a propósito: el widget oficial en vivo es de pago.
// El job mensual fx-refresh-stripe.ts avisa si la nota o el nº cambian.
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
    name: 'Marta Quintans',
    title: 'Cercanía y firmeza',
    text: 'No hay nadie en quien confíe tanto como en María. Es muy humana, pero también firme para sacar lo mejor de ti.',
  },
  {
    name: 'Víctor Espinosa',
    title: 'Su método funciona',
    text: 'María y Hamlet hacen un trabajo increíble. He mejorado mi físico y tengo mucha más energía en solo 2 meses. Siempre están atentos.',
  },
  {
    name: 'Sílvia Caballero',
    title: 'Superó mis expectativas',
    text: 'Mi experiencia superó todas mis expectativas. La relación ha ido mucho más allá de la de entrenadora-cliente.',
  },
  {
    name: 'Katiuska García',
    title: 'Resultados en la menopausia',
    text: 'Llevo más de 6 meses con Squad Fit. Estoy en menopausia y, a pesar de cuidarme, no lograba eliminar grasa de algunas zonas; con el entreno de fuerza y la alimentación por fin lo estoy consiguiendo.',
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

const TpStar = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
  </svg>
);

export default function TrustpilotPrograma() {
  const sliderRef = useRef(null);
  const { width } = useWindowSize();
  const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(reviews.length, sliderRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const w = width || 0;
  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: w >= 1280 ? '0px' : w >= 640 ? '40px' : '28px',
    slidesToShow: w >= 1280 ? 3 : 1,
    speed,
    beforeChange: onBeforeChange,
    arrows: false,
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
  };

  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#F8F9FC] overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

        {/* Cabecera: nota media + Trustpilot */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 sm:w-14 h-[2px] bg-[#FF690B] rounded-full" />
            <span className="text-[#FF690B] font-bold tracking-[0.2em] text-sm sm:text-xl uppercase">
              Opiniones reales
            </span>
            <span className="w-6 sm:w-14 h-[2px] bg-[#FF690B] rounded-full" />
          </div>

          <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-5xl tracking-tight mb-5">
            Excelente en Trustpilot
          </h2>

          <div className="flex flex-col items-center gap-3">
            <TrustStars count={5} size="w-8 h-8 sm:w-9 sm:h-9" />
            <p className="text-[#363C98] font-bold text-base sm:text-lg">
              <span className="text-2xl sm:text-3xl font-extrabold">{RATING}</span> / 5
              <span className="text-[#6B6BA8] font-medium"> · basado en {REVIEW_COUNT} opiniones verificadas</span>
            </p>
            <div className="flex items-center gap-1.5 text-[#00B67A] font-bold">
              <TpStar className="w-5 h-5" />
              <span>Trustpilot</span>
            </div>
          </div>
        </div>

        {/* Carrusel de reseñas */}
        <div className="relative px-2 sm:px-6">
          {mounted && (
            <Slider {...settings} ref={sliderRef}>
              {reviews.map((r, index) => (
                <div
                  key={index}
                  className="px-2 py-4 outline-none"
                  onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
                >
                  <div className="tp-card h-full w-full max-w-[420px] mx-auto bg-white rounded-[24px] p-6 sm:p-7 shadow-md border border-slate-100 flex flex-col text-left min-h-[240px]">
                    <div className="flex items-center justify-between mb-4">
                      <TrustStars count={5} size="w-6 h-6" />
                      <span className="flex items-center gap-1 text-[#00B67A] text-xs font-bold">
                        <TpStar className="w-4 h-4" />
                        Verificada
                      </span>
                    </div>
                    <h3 className="text-[#363C98] font-extrabold text-lg mb-2">{r.title}</h3>
                    <p className="text-[#64748B] leading-relaxed font-medium flex-grow">{r.text}</p>
                    <p className="text-[#363C98] font-bold mt-5">{r.name}</p>
                  </div>
                </div>
              ))}
            </Slider>
          )}

          {/* Flechas laterales (mismo estilo que los testimonios) */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="cursor-pointer absolute top-1/2 left-0 lg:left-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="cursor-pointer absolute top-1/2 right-0 lg:right-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        {/* CTA al perfil */}
        <div className="flex justify-center mt-10">
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

      {/* Realce de la tarjeta central del carrusel */}
      <style jsx global>{`
        .tp-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0.6; }
        .slick-current .tp-card { opacity: 1; box-shadow: 0 20px 40px rgba(54, 60, 152, 0.1); }
      `}</style>
    </section>
  );
}
