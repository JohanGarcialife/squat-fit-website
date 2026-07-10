'use client';

import React from 'react';
import Image from 'next/image';
import LandingButton from '../../../../components/LandingButton';

export default function InvestmentSection() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white py-20 sm:py-28 px-6 sm:px-12 md:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* --- Columna Izquierda: Texto --- */}
        <div className="flex flex-col text-left space-y-8 order-2 lg:order-1">
          
          <h2 className="text-[#363C98] font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight max-w-xl">
            Una inversión <br /> con sentido
          </h2>
          
          <div className="space-y-6 text-slate-700 text-lg sm:text-2xl leading-relaxed max-w-xl font-medium">
            <p>
              Trabajamos con personas comprometidas con su cambio.
            </p>
            <p>
              <span className="font-extrabold text-[#363C98]">No es un programa exprés</span> ni masivo. Si buscas resultados que duren, estás en el sitio correcto.
            </p>
          </div>

          <div className="pt-4">
            <LandingButton variant="orange" size="lg" autoShine onClick={handleScrollToPlans} className="flex items-center gap-2">
              <span>👉</span> Reserva tu plaza
            </LandingButton>
          </div>

        </div>

        {/* --- Columna Derecha: Imagen --- */}
        <div className="flex justify-center items-center order-1 lg:order-2">
          <div className="relative w-full max-w-[480px] aspect-square sm:max-w-[550px]">
            <Image
              src="/InvestmentRightImage.png"
              alt="Planificación y Progreso Squad Fit"
              fill
              priority
              sizes="(max-w-768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
