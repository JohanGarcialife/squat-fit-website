'use client';

import React from 'react';
import Image from 'next/image';
import LandingButton from '../../../../components/LandingButton';

export default function RelatableSection() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full py-24 sm:py-32 px-6 sm:px-12 md:px-24 flex flex-col items-center justify-center text-center overflow-hidden min-h-[500px] isolate">
      
      {/* Background Image */}
      <Image
        src="/GymBg.jpg"
        alt="Gym background"
        fill
        priority
        className="object-cover object-center -z-20"
      />

      {/* Dark Indigo Overlay */}
      <div className="absolute inset-0 bg-[#363C98]/70 -z-10" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-8 sm:space-y-10">
        
        {/* --- Título Principal --- */}
        <h2 className="text-white font-extrabold text-4xl sm:text-6xl tracking-tight">
          ¿Te suena esto?
        </h2>

        {/* --- Cuerpo del texto (Líneas principales) --- */}
        <div className="text-white/95 text-lg sm:text-2xl font-medium leading-relaxed space-y-2 max-w-3xl">
          <p>Has empezado mil veces y abandonado otras tantas.</p>
          <p>Sabes qué hacer, pero no consigues sostenerlo.</p>
          <p>Pierdes y recuperas el mismo peso una y otra vez.</p>
        </div>

        {/* --- Conclusión --- */}
        <p className="text-white font-semibold text-xl sm:text-2xl pt-2 max-w-2xl leading-relaxed">
          Si te reconoces aquí, este programa está pensado para ti.
        </p>

        {/* --- Botón CTA --- */}
        <div className="pt-4">
          <LandingButton variant="orange" size="lg" autoShine onClick={handleScrollToPlans}>
            Unirme al programa
          </LandingButton>
        </div>

      </div>
    </section>
  );
}
