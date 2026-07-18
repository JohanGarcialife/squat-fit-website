'use client';

import React from 'react';
import Image from 'next/image';
import LandingButton from '../../../../components/LandingButton';

export default function HeroPlanes() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 md:py-28 px-6 sm:px-12 md:px-16 lg:px-24">

      {/* Decorative Top Background Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#363c98]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Desktop (lg+): texto a la izquierda, foto a la derecha. Móvil/tablet: apilado y centrado. */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        {/* --- Columna de texto --- */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* --- Indicador: NUESTRO PROGRAMA --- */}
          <div className="flex items-center gap-4 mb-6 animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms] duration-700">
            <span className="w-8 sm:w-14 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-2xl uppercase whitespace-nowrap">
              NUESTRO PROGRAMA
            </span>
            <span className="w-8 sm:w-14 h-[2px] bg-primary rounded-full"></span>
          </div>

          {/* --- Título Principal --- */}
          <h1 className="text-[#363C98] font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-[1.1] tracking-tight mb-6 animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms] duration-700">
            Tu cambio, esta vez <span className="whitespace-nowrap">de verdad</span>
          </h1>

          {/* --- Subtítulo --- */}
          <p className="text-primary font-bold text-lg sm:text-2xl md:text-3xl max-w-xl mb-10 leading-relaxed animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:500ms] duration-700">
            Un programa de nutrición y entreno para lograr tu objetivo y mantener resultados.
          </p>

          {/* --- Botón CTA --- */}
          <div className="flex flex-col items-center lg:items-start animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:700ms] duration-700">
            <LandingButton variant="orange" size="xl" autoShine onClick={handleScrollToPlans} className="text-xl sm:text-2xl">
              Unirme al programa
            </LandingButton>
            <span className="mt-4 text-slate-400 text-sm sm:text-base font-medium tracking-wide">
              Plazas limitadas
            </span>
          </div>
        </div>

        {/* --- Columna de imagen (derecha en desktop) --- */}
        <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[460px] aspect-[4/5] flex-shrink-0 animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:900ms] duration-700">
          <Image
            src="/PlanesHeroImage.png"
            alt="El programa Squad Fit"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 460px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Simple animations injection */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
}
