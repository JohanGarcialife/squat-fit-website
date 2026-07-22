'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useWindowSize from '@/hooks/UseWindowSize';
import useSlickWrapSpeed from '@/hooks/useSlickWrapSpeed';
import usePreloadImages from '@/hooks/usePreloadImages';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

// Transformaciones reales de clientes del programa (fotos cedidas por cada
// persona, en /public/transformaciones/<slug>-antes.jpg y -despues.jpg).
const transformaciones = [
  { nombre: 'Rocío Maseda', meses: 6, slug: 'rocio-maseda' },
  { nombre: 'Azize Pratt', meses: 5, slug: 'azize-pratt' },
  { nombre: 'Luis Benito', meses: 7, slug: 'luis-benito' },
  { nombre: 'Manuel Sánchez', meses: 4, slug: 'manuel-sanchez' },
].map((t) => ({
  ...t,
  antes: `/transformaciones/${t.slug}-antes.jpg`,
  despues: `/transformaciones/${t.slug}-despues.jpg`,
}));

// Etiqueta superpuesta en cada foto del par (Antes / Después).
function FotoEtiqueta({ src, alt, etiqueta, colorClase }) {
  return (
    <div className="relative w-1/2 aspect-[4/5] overflow-hidden">
      <Image src={src} alt={alt} fill sizes="(min-width: 1280px) 200px, 45vw" className="object-cover" />
      <span
        className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold uppercase tracking-wider ${colorClase}`}
      >
        {etiqueta}
      </span>
    </div>
  );
}

export default function Transformaciones() {
  const sliderRef = useRef(null);
  const { width } = useWindowSize();
  const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(transformaciones.length, sliderRef);
  usePreloadImages(transformaciones.flatMap((t) => [t.antes, t.despues]));
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
    <section className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

        {/* Cabecera en marca (mismo patrón que el resto de secciones) */}
        <div className="w-full flex flex-col items-center mb-14 text-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap">
              Transformaciones
            </span>
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-[#363C98] font-extrabold text-4xl sm:text-6xl tracking-tight mt-2">
            Cambios reales, personas reales
          </h2>
        </div>

        {/* Carrusel de tarjetas antes/después */}
        <div className="relative px-2 sm:px-6">
          {mounted && (
            <Slider {...settings} ref={sliderRef}>
              {transformaciones.map((t, index) => (
                <div
                  key={t.slug}
                  className="cursor-pointer px-2 py-6 outline-none"
                  onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
                >
                  <div className="transf-card h-full w-full max-w-[390px] sm:max-w-[420px] mx-auto rounded-[28px] overflow-hidden shadow-md border border-slate-100/50 bg-[#F8F9FC] flex flex-col text-left">
                    <div className="flex">
                      <FotoEtiqueta
                        src={t.antes}
                        alt={`${t.nombre} antes del programa`}
                        etiqueta="Antes"
                        colorClase="bg-slate-500/90"
                      />
                      <FotoEtiqueta
                        src={t.despues}
                        alt={`${t.nombre} después del programa`}
                        etiqueta="Después"
                        colorClase="bg-[#FF690B]/90"
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex items-end justify-between gap-3">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#363C98] leading-tight">
                        {t.nombre}
                      </h3>
                      <span className="shrink-0 text-sm sm:text-base font-bold text-[#FF690B]">
                        en {t.meses} meses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}

          {/* Flechas circulares laterales (mismo estilo que los testimonios) */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="cursor-pointer absolute top-1/2 left-0 lg:left-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="cursor-pointer absolute top-1/2 right-0 lg:right-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

      </div>

      {/* Realce de la tarjeta central del carrusel */}
      <style jsx global>{`
        .transf-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0.6; }
        .slick-current .transf-card {
          opacity: 1;
          box-shadow: 0 20px 40px rgba(54, 60, 152, 0.1);
        }
      `}</style>
    </section>
  );
}
